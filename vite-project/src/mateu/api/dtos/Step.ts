import View from "./View";
import Rule from "./Rule";

export default interface Step {

    id: string;
    name: string;
    view: View;
    data: Map<string, object>;
    rules: Rule[];
    previousStepId: string;

}
