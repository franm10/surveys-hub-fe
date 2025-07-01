import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
    ApiResponse, QuestionResponse, StatsResponse, SubmissionSurveyCompleteResponse, SubmissionSurveyResponse,
    SurveyResponse
} from '../../template/interfaces/response-interfaces';
import {SurveyParamsRequest} from '../../template/interfaces/request-interfaces';

@Injectable({ providedIn: 'root' })
export class AdminService {

    private readonly base = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    getSurvey(surveyId: string): Observable<ApiResponse<SurveyResponse>> {
        return this.http.get<ApiResponse<SurveyResponse>>(
            `${this.base}/admin/surveys/${surveyId}`
        );
    }

    deleteSurvey(surveyId: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(
            `${this.base}/admin/surveys/${surveyId}`
        );
    }

    getAllSurveys(): Observable<ApiResponse<SurveyResponse[]>> {
        return this.http.get<ApiResponse<SurveyResponse[]>>(
            `${this.base}/admin/surveys/get-all`
        );
    }

    getAllQuestionsFromSurvey(surveyId: string): Observable<ApiResponse<QuestionResponse[]>> {
        const params = new HttpParams().set('survey', surveyId);
        return this.http.get<ApiResponse<QuestionResponse[]>>( `${this.base}/admin/questions`, {params} );
    }

    getAllStatsFromSurvey(surveyId: string): Observable<ApiResponse<StatsResponse>> {
        const params = new HttpParams().set('survey', surveyId);
        return this.http.get<ApiResponse<StatsResponse>>( `${this.base}/admin/stats`, {params} );
    }

    /** *************** COMMON API END *************** */

}
