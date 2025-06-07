import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import yaml from 'js-yaml';
import { SupportedFormat } from './types';

/**
 * Converts data between different formats (JSON, XML, YAML)
 * @param data - The input data string to convert
 * @param from - The source format of the input data
 * @param to - The target format for the output data
 * @returns The converted data as a string
 * @throws Error if the input data is invalid for the specified format
 */
export const convert = (data: string, from: SupportedFormat, to: SupportedFormat): string => {
  if (from === to) {
    return data;
  }

  let intermediate: unknown;
  if (from === 'xml') {
    intermediate = new XMLParser().parse(data);
  } else if (from === 'yaml') {
    intermediate = yaml.load(data);
  } else {
    intermediate = JSON.parse(data);
  }

  let result: string;
  if (to === 'xml') {
    result = new XMLBuilder().build(intermediate);
  } else if (to === 'yaml') {
    result = yaml.dump(intermediate);
  } else {
    result = JSON.stringify(intermediate, null, 2);
  }
  return result;
}
