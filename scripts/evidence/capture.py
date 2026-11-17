"""Capture source-owned gateway evidence. No qualification or release authority."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time
import zipfile
import uuid


def capture(output):
    output = Path(output)
    if os.environ.get('GITHUB_ACTIONS') == 'true':
        raise SystemExit('local execution required')
    source = Path.cwd().resolve()
    output = output.resolve()
    if output.is_relative_to(source):
        raise SystemExit('evidence output must be outside the source checkout')
    if output.exists() and any(output.iterdir()):
        raise SystemExit('evidence output must be empty; preserve previous runs')
    output.mkdir(parents=True, exist_ok=True)
    subprocess.run(['npm', 'run', 'build', '--workspace', 'gateway'], check=True)
    result = subprocess.run(['node', '--test', '--test-reporter=tap', *map(str, sorted(Path('gateway/test').glob('*.test.js')))], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (output / 'tests.tap').write_bytes(result.stdout)
    print(result.stdout.decode(), end='')
    if result.returncode:
        raise SystemExit(result.returncode)
    text = result.stdout.decode()
    passed = re.findall(r'^# pass (\d+)$', text, re.M)
    failed = re.findall(r'^# fail (\d+)$', text, re.M)
    if len(passed) != 1 or not int(passed[0]) or failed != ['0']:
        raise SystemExit('missing native test summary')
    with zipfile.ZipFile(output / 'gateway.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        paths = [Path('gateway/package.json'), *sorted(Path('gateway/dist').rglob('*'))]
        for path in paths:
            if path.is_file():
                # Fixed metadata makes equal packaged bytes compare across local runs.
                member = zipfile.ZipInfo(path.relative_to('gateway').as_posix(), (1980, 1, 1, 0, 0, 0))
                member.compress_type = zipfile.ZIP_DEFLATED
                member.create_system = 3
                member.external_attr = 0o100644 << 16
                archive.writestr(member, path.read_bytes())
    sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    dirty = bool(subprocess.check_output(['git', 'status', '--porcelain', '--untracked-files=normal'], text=True).strip())
    def digest(name):
        return 'sha256:' + hashlib.sha256((output / name).read_bytes()).hexdigest()
    record = {
        'repository': 'advatar/Loggify', 'commit': sha,
        'run': 'local-' + uuid.uuid4().hex,
        'execution': 'local', 'source_dirty': dirty,
        'issuer': None, 'signature': None,
        'scope': {'product': 'Loggify gateway', 'intended_use': 'non-medical semantic telemetry ingest',
                  'model': 'none', 'market': 'engineering-review-only', 'cohort': 'no-human-participants'},
        'captured_at': int(time.time()),
        'toolchain': {'node': subprocess.check_output(['node', '--version'], text=True).strip(),
                      'npm': subprocess.check_output(['npm', '--version'], text=True).strip()},
        'artifact': {'path': 'gateway.zip', 'digest': digest('gateway.zip')},
        'test_evidence': {'path': 'tests.tap', 'digest': digest('tests.tap')},
        'tests': {'command': 'npm run build --workspace gateway; node --test --test-reporter=tap gateway/test/*.test.js', 'passed': int(passed[0]), 'failed': 0},
        'limits': ['Gateway native tests only; other SDK/deployment checks are outside this capture.',
                   'Node runtime is external to the ZIP; launch with node dist/server.js.',
                   'No model inference, clinical evidence, legal judgement, QMS approval or release permission.'],
    }
    (output / 'build-record.json').write_text(json.dumps(record, indent=2) + '\n')
    print('Local evidence written to ' + str(output))



if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output')
    capture(parser.parse_args().output)
