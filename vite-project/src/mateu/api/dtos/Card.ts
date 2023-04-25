import ViewMetadata from "./ViewMetadata";
import FieldGroup from "./FieldGroup";

export default interface Card extends ViewMetadata {

    dataPrefix: string

    title: string;

    subtitle: string;

    fieldGroups: FieldGroup[];

}
