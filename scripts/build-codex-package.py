#!/usr/bin/env python3
"""Build the Codex marketplace bundle from tracked runtime files."""

import argparse
from pathlib import Path
import shutil
import stat
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / 'plugins/dmi-superpowers'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail when the committed bundle is stale')
    args = parser.parse_args()
    tracked = subprocess.check_output([
        'git', 'ls-files', '-z', '--', '.codex-plugin/plugin.json',
        'skills', 'hooks', 'assets', 'LICENSE',
    ], cwd=ROOT).decode().split('\0')
    expected = {}
    for name in filter(None, tracked):
        source = ROOT / name
        if source.is_symlink():
            parser.error('Codex bundles cannot contain symlinks: ' + name)
        if name.endswith('.test.js'):
            continue
        expected[name] = (source.read_bytes(), stat.S_IMODE(source.stat().st_mode) & 0o111)
    expected_directories = {str(parent) for name in expected for parent in Path(name).parents
                            if parent != Path('.')}
    actual = {}
    actual_directories = set()
    if DESTINATION.exists():
        for path in DESTINATION.rglob('*'):
            if path.is_symlink():
                parser.error('Unexpected symlink in bundle: ' + str(path))
            if path.is_dir():
                actual_directories.add(str(path.relative_to(DESTINATION)))
            if path.is_file():
                actual[str(path.relative_to(DESTINATION))] = (
                    path.read_bytes(), stat.S_IMODE(path.stat().st_mode) & 0o111)
    if args.check:
        if actual != expected or actual_directories != expected_directories:
            parser.exit(1, 'Codex bundle is stale; run python3 scripts/build-codex-package.py\n')
        print('Codex bundle matches tracked runtime files')
        return
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=DESTINATION.parent) as directory:
        staging = Path(directory) / 'bundle'
        for name in expected:
            target = staging / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / name, target)
        if DESTINATION.exists():
            shutil.rmtree(DESTINATION)
        staging.rename(DESTINATION)
    print('Built Codex bundle at ' + str(DESTINATION.relative_to(ROOT)))


if __name__ == '__main__':
    main()
