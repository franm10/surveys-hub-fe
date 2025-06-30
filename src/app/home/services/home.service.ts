import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment.dev';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
    ApiResponse,
    QuestionResponse,
    StatsResponse,
    SurveyResponse
} from '../../template/interfaces/response-interfaces';

@Injectable({ providedIn: 'root' })
export class HomeService {

    private readonly base = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    getAllPublicSurveys(): Observable<ApiResponse<SurveyResponse[]>> {
        return this.http.get<ApiResponse<SurveyResponse[]>>( `${this.base}/public/surveys/get-all` );
    }

    getQuestionsFromPublicSurvey(surveyId: string): Observable<ApiResponse<QuestionResponse[]>> {
        const params = new HttpParams().set('survey', surveyId);
        return this.http.get<ApiResponse<QuestionResponse[]>>( `${this.base}/public/questions`, {params} );
    }

    getStatsFromPublicSurvey(surveyId: string): Observable<ApiResponse<StatsResponse>> {
        const params = new HttpParams().set('survey', surveyId);
        return this.http.get<ApiResponse<StatsResponse>>( `${this.base}/public/stats`, {params} );
    }

}
