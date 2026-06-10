declare module "country-list" {
  export interface Country {
    code: string;
    name: string;
  }

  export function overwrite(countries: { [key: string]: string }[]): void;
  export function getCode(name: string): string | undefined;
  export function getName(code: string): string | undefined;
  export function getNames(): string[];
  export function getCodes(): string[];
  export function getData(): Country[];
  export function getCodeList(): { [key: string]: string };
  export function getNameList(): { [key: string]: string };
}
