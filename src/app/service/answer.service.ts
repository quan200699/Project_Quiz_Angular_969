import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Answer} from '../model/answer';
import {environment} from '../../environments/environment';

const API_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  constructor(private http: HttpClient) {
  }

  listAnswer(): Observable<Answer[]> {
    return this.http.get<Answer[]>(API_URL + '/answers');
  }

  createAnswer(answer: Answer): Observable<Answer> {
    return this.http.post<Answer>(API_URL + '/answers', answer);
  }

  updateAnswer(answer: Answer, id: number): Observable<Answer> {
    return this.http.put<Answer>(API_URL + '/answers', answer);
  }

  deleteAnswer(id: number): Observable<Answer> {
    return this.http.delete<Answer>(API_URL + '/answers');
  }

  getAnswer(id: number): Observable<Answer> {
    return this.http.get<Answer>(API_URL + '/answers');
  }
}
