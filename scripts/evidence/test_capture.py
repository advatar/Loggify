"""Refusal tests for product capture; native gateway tests run separately."""
import contextlib
import io
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from capture import capture


class CaptureRefusalTest(unittest.TestCase):
    def test_failed_native_suite_cannot_produce_build_record(self):
        with tempfile.TemporaryDirectory() as temp:
            with patch('capture.subprocess.run', side_effect=[None, subprocess.CompletedProcess([], 1, b'not ok 1 - failed\n')]):
                with contextlib.redirect_stdout(io.StringIO()), self.assertRaises(SystemExit):
                    capture(temp)
            self.assertTrue((Path(temp)/'tests.tap').is_file())
            self.assertFalse((Path(temp)/'build-record.json').exists())
            self.assertFalse((Path(temp)/'gateway.zip').exists())

    def test_zero_tests_and_ambiguous_summary_cannot_produce_evidence(self):
        for text in (b'# pass 0\n# fail 0\n', b'# pass 4\n# fail 1\n', b'# pass 4\n# pass 1\n# fail 0\n', b'no tests'):
            with self.subTest(text=text), tempfile.TemporaryDirectory() as temp:
                with patch('capture.subprocess.run', side_effect=[None, subprocess.CompletedProcess([], 0, text)]):
                    with contextlib.redirect_stdout(io.StringIO()), self.assertRaises(SystemExit):
                        capture(temp)
                self.assertFalse((Path(temp)/'build-record.json').exists())
                self.assertFalse((Path(temp)/'gateway.zip').exists())


if __name__ == '__main__':unittest.main()
