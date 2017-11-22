import { INumberFormatterOptions } from "./INumberFormatterOptions";
export declare class NumberFormatter {
    private superscripts;
    private options;
    constructor(settings: INumberFormatterOptions);
    format(originalInput: any, isEditable?: boolean): string;
    toSuperscript(exponent: string): string;
}
