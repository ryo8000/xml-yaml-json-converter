import { convert } from '../formatConverter';
import * as fs from 'fs';
import * as path from 'path';

const readFixture = (filename: string): string => {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename), 'utf8');
};

describe('convert', () => {
  describe('Same format conversion', () => {
    it('should return the same data when from and to formats are identical', () => {
      const input = readFixture('test-data.json');
      const actual = convert(input, 'json', 'json');
      expect(actual).toEqual(input);
    });
  });

  describe('XML to JSON conversion', () => {
    it('should convert XML to JSON', () => {
      const input = readFixture('test-data.xml');
      const expectedJson = readFixture('expected-output.json');
      const actual = convert(input, 'xml', 'json');
      const parsed = JSON.parse(actual);
      const expected = JSON.parse(expectedJson);
      expect(parsed).toEqual(expected);
    });
  });

  describe('XML to YAML conversion', () => {
    it('should convert XML to YAML', () => {
      const input = readFixture('test-data.xml');
      const expected = readFixture('xml-to-yaml-expected.yaml');
      const actual = convert(input, 'xml', 'yaml');
      expect(actual).toEqual(expected);
    });
  });

  describe('YAML to XML conversion', () => {
    it('should convert YAML to XML', () => {
      const input = readFixture('test-data.yaml');
      const expected = readFixture('yaml-to-xml-expected.xml');
      const actual = convert(input, 'yaml', 'xml');
      expect(actual).toEqual(expected);
    });
  });

  describe('YAML to JSON conversion', () => {
    it('should convert YAML to JSON', () => {
      const input = readFixture('test-data.yaml');
      const expectedJson = readFixture('expected-output.json');
      const actual = convert(input, 'yaml', 'json');
      const parsed = JSON.parse(actual);
      const expected = JSON.parse(expectedJson);
      expect(parsed).toEqual(expected);
    });
  });

  describe('JSON to XML conversion', () => {
    it('should convert JSON to XML', () => {
      const input = readFixture('test-data.json');
      const expected = readFixture('json-to-xml-expected.xml');
      const actual = convert(input, 'json', 'xml');
      expect(actual).toEqual(expected);
    });
  });

  describe('JSON to YAML conversion', () => {
    it('should convert JSON to YAML', () => {
      const input = readFixture('test-data.json');
      const expected = readFixture('json-to-yaml-expected.yaml');
      const actual = convert(input, 'json', 'yaml');
      expect(actual).toEqual(expected);
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid data', () => {
      const input = '{"name": "John"';
      expect(() => {
        convert(input, 'json', 'xml');
      }).toThrow();
    });
  });
});
