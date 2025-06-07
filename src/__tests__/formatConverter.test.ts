import { convert } from '../formatConverter';

describe('convert', () => {
  describe('Same format conversion', () => {
    it('should return the same data when from and to formats are identical', () => {
      const json = '{"name": "John"}';
      const result = convert(json, 'json', 'json');
      expect(result).toBe(json);
    });
  });

  describe('XML to JSON conversion', () => {
    it('should convert simple XML to JSON', () => {
      const xml = '<root><name>John</name><age>30</age></root>';
      const result = convert(xml, 'xml', 'json');
      const parsed = JSON.parse(result);
      expect(parsed.root.name).toBe('John');
      expect(parsed.root.age).toBe(30);
    });
  });

  describe('XML to YAML conversion', () => {
    it('should convert simple XML to YAML', () => {
      const xml = '<root><name>John</name><age>30</age></root>';
      const result = convert(xml, 'xml', 'yaml');
      expect(result).toContain('name: John');
      expect(result).toContain('age: 30');
    });
  });

  describe('YAML to XML conversion', () => {
    it('should convert simple YAML to XML', () => {
      const yaml = 'name: John\nage: 30';
      const result = convert(yaml, 'yaml', 'xml');
      expect(result).toContain('<name>John</name>');
      expect(result).toContain('<age>30</age>');
    });
  });

  describe('YAML to JSON conversion', () => {
    it('should convert simple YAML to JSON', () => {
      const yaml = 'name: John\nage: 30';
      const result = convert(yaml, 'yaml', 'json');
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('John');
      expect(parsed.age).toBe(30);
    });
  });

  describe('JSON to XML conversion', () => {
    it('should convert simple JSON to XML', () => {
      const json = '{"name": "John", "age": 30}';
      const result = convert(json, 'json', 'xml');
      expect(result).toContain('<name>John</name>');
      expect(result).toContain('<age>30</age>');
    });
  });

  describe('JSON to YAML conversion', () => {
    it('should convert simple JSON to YAML', () => {
      const json = '{"name": "John", "age": 30}';
      const result = convert(json, 'json', 'yaml');
      expect(result).toContain('name: John');
      expect(result).toContain('age: 30');
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid JSON', () => {
      const invalidJson = '{"name": "John"';
      expect(() => {
        convert(invalidJson, 'json', 'xml');
      }).toThrow();
    });
  });
});
