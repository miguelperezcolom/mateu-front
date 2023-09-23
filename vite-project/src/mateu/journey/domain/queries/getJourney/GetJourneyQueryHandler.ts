import {GetJourneyQuery} from "./GetJourneyQuery";
import Journey from "../../../../shared/apiClients/dtos/Journey";
import MateuApiClient, {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";

export class GetJourneyQueryHandler {

    public async handle(query: GetJourneyQuery): Promise<Journey> {
        return await mateuApiClient.fetchJourney(state.journeyTypeId!, state.journeyId!)
    }

}

export const getJourneyQueryHandler = new GetJourneyQueryHandler()