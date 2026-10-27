import hashlib
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]


def fingerprint(root):
    """Reproduce Codex 0.164's plugin bundle fingerprint, including directory names."""
    digest = hashlib.sha256(b'codex-plugin-bundle-v1')
    pending = [root]
    while pending:
        path = pending.pop()
        if path.name in ('__pycache__', '.venv') or path.name.endswith(('.pyc', '.egg-info')):
            continue
        name = b'' if path == root else os.fsencode(str(path.relative_to(root)))
        digest.update(struct.pack('<Q', len(name)))
        digest.update(name)
        if path.is_symlink():
            raise ValueError('Plugin bundles cannot contain symlinks')
        if path.is_dir():
            digest.update(b'directory')
            pending.extend(sorted(path.iterdir(), key=lambda p: os.fsencode(p.name), reverse=True))
        else:
            content = path.read_bytes()
            digest.update(b'file')
            digest.update(struct.pack('<Q', len(content)))
            digest.update(content)
    return digest.hexdigest()


class CodexPackageTest(unittest.TestCase):
    def test_builder_rejects_unexpected_empty_directories(self):
        with tempfile.TemporaryDirectory() as directory:
            checkout = Path(directory)
            (checkout / 'scripts').mkdir()
            shutil.copy2(ROOT / 'scripts/build-codex-package.py', checkout / 'scripts')
            (checkout / 'hooks').mkdir()
            (checkout / 'hooks/example').write_text('runtime source\n')
            subprocess.run(['git', 'init', '-q', str(checkout)], check=True)
            subprocess.run(['git', '-C', str(checkout), 'add', 'hooks'], check=True)
            command = ['python3', str(checkout / 'scripts/build-codex-package.py')]
            subprocess.run(command, check=True, capture_output=True)
            self.assertEqual(subprocess.run(command + ['--check'], capture_output=True).returncode, 0)
            (checkout / 'plugins/dmi-superpowers/unexpected-empty-directory').mkdir()
            result = subprocess.run(command + ['--check'], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('bundle is stale', result.stderr)

    def test_repository_metadata_does_not_invalidate_plugin_trust(self):
        with tempfile.TemporaryDirectory() as directory:
            checkout = Path(directory) / 'checkout'
            shutil.copytree(ROOT, checkout, ignore=shutil.ignore_patterns(
                '.git', '.worktrees', '.private-journal', '.claude', '.superpowers',
                'node_modules', 'evals', '__pycache__', '.DS_Store'))
            candidates = ('.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json')
            manifest = next(checkout / name for name in candidates if (checkout / name).is_file())
            plugin = json.loads(manifest.read_text())['plugins'][0]
            bundle = checkout / plugin['source']
            metadata = checkout / '.git'
            metadata.mkdir()
            (metadata / 'HEAD').write_text('ref: refs/heads/main\n')
            approved = fingerprint(bundle)
            (metadata / 'FETCH_HEAD').write_text('Updated by marketplace refresh\n')
            self.assertEqual(fingerprint(bundle), approved,
                             'Git-only marketplace changes must not require hook reapproval')

    def test_real_hook_changes_still_invalidate_trust(self):
        with tempfile.TemporaryDirectory() as directory:
            bundle = Path(directory) / 'bundle'
            shutil.copytree(ROOT / 'plugins/dmi-superpowers', bundle)
            approved = fingerprint(bundle)
            hook = bundle / 'hooks/session-start-codex'
            hook.write_bytes(hook.read_bytes() + b'\n')
            self.assertNotEqual(fingerprint(bundle), approved)

    def test_hook_state_is_written_outside_the_bundle(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bundle, data = root / 'bundle', root / 'data'
            shutil.copytree(ROOT / 'plugins/dmi-superpowers', bundle)
            approved = fingerprint(bundle)
            result = subprocess.run(
                ['node', str(bundle / 'hooks/ponytail-mode-tracker.js')],
                input=json.dumps({'prompt': 'ponytail ultra'}), capture_output=True, text=True,
                env={'PATH': os.environ['PATH'], 'HOME': str(root / 'home'),
                     'PLUGIN_ROOT': str(bundle), 'PLUGIN_DATA': str(data)}, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual((data / '.ponytail-active').read_text(), 'ultra')
            self.assertEqual(fingerprint(bundle), approved)


if __name__ == '__main__':
    unittest.main()
