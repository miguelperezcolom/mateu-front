import Field from "../../../../../../api/dtos/Field";
import Component from "./section/fieldGroup/field/fields/interfaces/Component";

export default class FieldWrapper {

    field: Field;

    constructor(field:Field) {
        this.field = field;
    }

    visible: boolean = true;

    enabled: boolean = true;

    container: HTMLElement | undefined = undefined;

    component: Component | undefined = undefined;

    setVisible(visible: boolean) {
        this.visible = visible;
        this.container?.setAttribute('style', 'display: ' + (this.visible?'block':'none'));
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        this.component?.setEnabled(this.enabled);
    }
}
