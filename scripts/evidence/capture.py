"""Capture source-owned gateway evidence. No qualification or release authority."""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time
import zipfile


def capture(output):
    output = Path(output)
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
                archive.write(path, path.relative_to('gateway'))
    sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    if os.environ.get('GITHUB_SHA', sha) != sha:
        raise SystemExit('checkout/source mismatch')
    def digest(name):
        return 'sha256:' + hashlib.sha256((output / name).read_bytes()).hexdigest()
    record = {
        'repository': 'advatar/Loggify', 'commit': sha,
        'run': os.environ.get('GITHUB_RUN_ID', 'local-unattested'),
        'attempt': os.environ.get('GITHUB_RUN_ATTEMPT', '0'),
        'issuer': 'advatar/Loggify/.github/workflows/native-evidence.yml',
        'scope': {'product': 'Loggify gateway', 'intended_use': 'non-medical semantic telemetry ingest',
                  'model': 'none', 'market': 'engineering-review-only', 'cohort': 'no-human-participants'},
        'captured_at': int(time.time()),
        'toolchain': {'node': subprocess.check_output(['node', '--version'], text=True).strip(),
                      'npm': subprocess.check_output(['npm', '--version'], text=True).strip()},
        'artifact': {'path': 'gateway.zip', 'digest': digest('gateway.zip')},
        'test_evidence': {'path': 'tests.tap', 'digest': digest('tests.tap')},
        'tests': {'command': 'npm run build --workspace gateway; node --test --test-reporter=tap gateway/test/*.test.js', 'passed': int(passed[0]), 'failed': 0},
        'limits': ['Gateway native tests only; other SDK/deployment checks remain in ordinary CI.',
                   'Node runtime is external to the ZIP; launch with node dist/server.js.',
                   'No model inference, clinical evidence, legal judgement, QMS approval or release permission.'],
    }
    (output / 'build-record.json').write_text(json.dumps(record, indent=2) + '\n')
    # Public code and fictional test metadata only. This bounded log transport
    # survives artifact quota failures; consumers must still verify attestation.
    files = {name: base64.b64encode((output / name).read_bytes()).decode()
             for name in ('gateway.zip', 'tests.tap', 'build-record.json')}
    encoded = base64.b64encode(json.dumps(files, sort_keys=True).encode()).decode()
    if len(encoded) > 200000:
        raise SystemExit('log evidence exceeds bounded fallback')
    print('ALIGN_PUBLIC_EVIDENCE_V1:' + encoded)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output')
    capture(parser.parse_args().output)
