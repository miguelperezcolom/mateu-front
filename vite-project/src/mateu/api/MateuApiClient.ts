import UI from "./dtos/UI";
import axios, {AxiosResponse} from "axios";
import JourneyType from "./dtos/JourneyType";
import Journey from "./dtos/Journey";
import Step from "./dtos/Step";

let abortControllers: AbortController[] = [];
let fetchRowsAbortController0 = new AbortController()
let fetchRowsAbortController1 = new AbortController()

export default class MateuApiClient {

    axiosInstance = axios.create({timeout: 10000})

    baseUrl = ''

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    async wrap<T>(call: Promise<T>): Promise<T> {
        dispatchEvent(new CustomEvent('backend-called-event', {
            bubbles: true,
            composed: true,
            detail: {
            }
        }))
        return call.then(response => {
            console.log(response)
            dispatchEvent(new CustomEvent('backend-succeeded-event', {
                bubbles: true,
                composed: true,
                detail: {
                }
            }))
            return response
        }).catch((reason) => {
            if (reason.code == 'ERR_CANCELED') {
                dispatchEvent(new CustomEvent('backend-cancelled-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                    }
                }))
            } else {
                console.log('error on api call', reason)
                dispatchEvent(new CustomEvent('backend-failed-event', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        reason: reason
                    }
                }))
            }
            return reason
        })
    }

    async getMax2(uri: string): Promise<AxiosResponse> {
        fetchRowsAbortController0.abort()
        fetchRowsAbortController0 = fetchRowsAbortController1
        const abortController =  new AbortController();
        fetchRowsAbortController1 = abortController

        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.get(uri, {
            signal: abortController.signal
        });
    }

    async get(uri: string): Promise<AxiosResponse> {
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.get(uri, {
            signal: abortController.signal
        });
    }

    async post(uri: string, data: unknown): Promise<void> {
        const abortController =  new AbortController();
        abortControllers = [...abortControllers, abortController]

        return this.axiosInstance.post(uri, data,{
            signal: abortController.signal
        });
    }

    async abortAll() {
        console.log('aborting api calls', abortControllers)
        abortControllers.forEach(c => c.abort());
        abortControllers = []
        console.log('api calls cancelled')
    }

    async fetchUi(uiId: string): Promise<UI> {
        return await this.wrap<UI>(this.get(this.baseUrl + '/uis/' + uiId)
            .then((response) => response.data))
    }

    async fetchJourneyTypes(): Promise<JourneyType[]> {
        return await this.wrap<JourneyType[]>(this.get(this.baseUrl + '/journey-types')
            .then((response) => response.data))
    }

    async createJourney(journeyType: string, journeyId: string): Promise<void> {
        return await this.wrap<void>(this.post(this.baseUrl + '/journeys/'
            + journeyType + '/' + journeyId,
            {
                    contextData: []
                }
            ))
    }

    async fetchJourney(journeyType: string, journeyId: string): Promise<Journey> {
        return await this.wrap<Journey>(this.get(this.baseUrl + '/journeys/'
            + journeyType + '/' + journeyId)
                .then((response) => response.data))
    }

    async fetchStep(journeyType: string, journeyId: string, stepId: string): Promise<Step> {
        return await this.wrap<Step>(this.get(this.baseUrl + '/journeys/' +
            journeyType + '/' + journeyId + '/steps/' + stepId)
                .then((response) => response.data))
    }

    async runStepAction(journeyType: string, journeyId: string, stepId: string, actionId: string,
                        data: unknown): Promise<void> {
        return await this.wrap<void>(this.post(this.baseUrl + '/journeys/' +
            journeyType + '/' + journeyId + '/steps/' + stepId
                + '/' + actionId, {
                    data: data
                }
            )).then(response => {
            dispatchEvent(new CustomEvent('action-called', {
                bubbles: true,
                composed: true,
                detail: {
                }
            }))
            return response;
        })
    }

    async fetchRows(journeyType: string, journeyId: string, stepId: string, listId: string,
                    page: number, pageSize: number,
                    sortOrders: string, filters: string
                    ): Promise<any[]> {
        return await this.wrap<any[]>(this.getMax2(this.baseUrl + "/journeys/" + journeyType
            + '/' + journeyId +
            "/steps/" + stepId +
            "/lists/" + listId + "/rows?page=" + page + "&page_size=" + pageSize +
            "&ordering=" + sortOrders + "&filters=" + filters)
            .then((response) => response.data))
    }

    async fetchCount(journeyType: string, journeyId: string, stepId: string, listId: string,
                     filters: string
    ): Promise<number> {
        return await this.wrap<number>(this.get(this.baseUrl + "/journeys/" + journeyType
            + '/' + journeyId
            + "/steps/" + stepId +
            "/lists/" + listId + "/count?filters=" + filters)
            .then((response) => response.data))
    }

}
