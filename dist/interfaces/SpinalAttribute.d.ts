/**
 * @property {spinal.Str} label
 * @property {spinal.Str} value
 * @property {spinal.Val} date
 * @property {spinal.Str} type
 * @property {spinal.Str} unit
 * @interface SpinalAttribute
 * @extends {spinal.Model}
 */
export interface SpinalAttribute extends spinal.Model {
    label: spinal.Str;
    value: spinal.Str;
    date: spinal.Val;
    type: spinal.Str;
    unit: spinal.Str;
}
