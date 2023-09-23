import {GoBackCommand} from "./GoBackCommand";
import MateuApiClient, {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";

export class GoBackCommandHandler {

    public async handle(command: GoBackCommand): Promise<void> {
        state.step = await mateuApiClient
            .fetchStep(state.journeyTypeId!, state.journeyId!, state.previousStepId!)
        state.previousStepId = state.step.previousStepId
    }

}

export const goBackCommandHandler = new GoBackCommandHandler()