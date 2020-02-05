import {Component, OnInit, ViewChild} from '@angular/core';
import {Question} from '../../model/question';
import {Subscription} from 'rxjs';
import {QuizService} from '../../service/quiz.service';
import {QuestionService} from '../../service/question.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AnswerService} from '../../service/answer.service';
import {Answer} from '../../model/answer';
import {FormControl, FormGroup} from '@angular/forms';
import {NotificationService} from '../../service/notification.service';
import {CorrectAnswerService} from '../../service/correct-answer.service';
import {ExamService} from '../../service/exam.service';
import {CountdownComponent} from 'ngx-countdown';
import {Result} from '../../model/result';
import {AuthenticationService} from '../../service/authentication.service';
import {ResultService} from '../../service/result.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';

declare var $;

@Component({
  selector: 'app-do-exam',
  templateUrl: './do-exam.component.html',
  styleUrls: ['./do-exam.component.css']
})
export class DoExamComponent implements OnInit {
  @ViewChild('countdown', {static: false}) counter: CountdownComponent;
  @ViewChild('timeUp', {static: false}) timeUp: NgbModalRef;
  questionList: Question[] = [];
  answerList: Answer[] = [];
  quizId: number;
  examId: number;
  sub: Subscription;
  quizName: string;
  examName: string;
  minutes: number;
  answerForm: FormGroup = new FormGroup({
    content: new FormControl(''),
    question: new FormControl('')
  });
  isCorrectTime: boolean;
  questionIndex = 0;
  isSubmitted: boolean;
  numberOfCorrectQuestion = 0;
  point = 0;
  checkboxContent = new Set();
  checked: boolean;
  currentUser: any;

  constructor(private quizService: QuizService,
              private examService: ExamService,
              private questionService: QuestionService,
              private answerService: AnswerService,
              private correctAnswerService: CorrectAnswerService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              private resultService: ResultService,
              private modalService: NgbModal) {
    this.isSubmitted = false;
  }

  ngOnInit() {
    this.getExamDetail();
    $('#aaa').show();
  }

  getExamDetail() {
    this.sub = this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      this.examId = +paramMap.get('id');
      this.examService.getExam(this.examId).subscribe(exam => {
        this.examName = exam.name;
        this.quizService.getQuiz(exam.quiz.id).subscribe(quiz => {
          this.quizName = quiz.name;
          this.quizId = quiz.id;
          this.minutes = quiz.minutes;
          this.getQuestionListByQuiz(quiz.id);
          this.doExam(this.examId);
        });
      });
    });
  }

  getAnswerListByQuestion(question: Question) {
    this.answerService.listAnswerByQuestion(question.id).subscribe(value => {
      this.answerList = value;
      question.answers = this.answerList;
    }, error => {
      console.log(error);
    });
  }

  getQuestionListByQuiz(quizId: number) {
    this.questionService.findAllQuestionByQuiz(quizId).subscribe(result => {
      this.questionList = result;
      for (const question of this.questionList) {
        this.getAnswerListByQuestion(question);
      }
    }, error => {
      console.log(error);
    });
  }

  doExam(examId: number) {
    this.examService.doExam(examId).subscribe(() => {
      this.isCorrectTime = true;
    }, () => {
      this.notificationService.showError('<h5>Chưa đến giờ thi</h5>', 'Thông báo');
      this.router.navigate(['/user/exam']);
    });
  }

  click(questionId) {
    this.answerService.listAnswerByQuestion(questionId).subscribe(value => {
      for (let i = 0; i < value.length; i++) {
        this.checked = (document.getElementById('answerCheckbox' + i) as HTMLInputElement).checked;
        if (this.checked) {
          this.checkboxContent.add((document.getElementById('answerCheckbox' + i) as HTMLInputElement).value);
        }
      }
    });
  }

  next(questionId) {
    this.questionIndex++;
    this.correctAnswerService.listCorrectAnswerByQuestion(questionId).subscribe(listCorrectAnswer => {
      const answer: Answer = {
        id: this.answerForm.value.id,
        content: this.answerForm.value.content,
        question: {
          id: questionId
        }
      };
      this.questionService.getQuestion(questionId).subscribe(question => {
        if (question.typeOfQuestion.id === 2) {
          let count = 0;
          for (const checkboxAnswer of this.checkboxContent) {
            for (const correctAnswer of listCorrectAnswer) {
              if (checkboxAnswer === correctAnswer.content) {
                count++;
              }
            }
          }
          if (count === listCorrectAnswer.length) {
            this.numberOfCorrectQuestion++;
          } else {
            this.numberOfCorrectQuestion += count / listCorrectAnswer.length;
          }
        } else {
          for (const correctAnswer of listCorrectAnswer) {
            if (answer.content === correctAnswer.content) {
              this.numberOfCorrectQuestion++;
            }
          }
        }
        if (this.questionIndex > this.questionList.length - 1) {
          this.counter.pause();
          this.getExam();
          this.isSubmitted = true;
          this.questionIndex = 0;
        }
        this.answerForm.reset();
      });
    });
  }

  previous() {
    this.questionIndex--;
  }

  calculatePoint(quizId: number) {
    this.questionService.findAllQuestionByQuiz(quizId).subscribe(questionList => {
      this.questionList = questionList;
      this.point += this.numberOfCorrectQuestion / this.questionList.length * 10;
      this.authenticationService.currentUser.subscribe(user => {
        this.sub = this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
          this.examId = +paramMap.get('id');
          this.currentUser = user;
          const result: Result = {
            point: this.point,
            user: {
              id: this.currentUser.id
            },
            exam: {
              id: this.examId
            }
          };
          this.resultService.createResult(result).subscribe(() => {
          }, () => {
          });
        });
      });
    });
  }

  onTimerFinished($event) {
    if ($event.left === 0) {
      this.openVerticallyCentered(this.timeUp);
      this.questionIndex = this.questionList.length;
      this.getExam();
      this.isSubmitted = true;
      this.questionIndex = 0;
    }
  }

  getExam() {
    this.sub = this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      this.examId = +paramMap.get('id');
      this.examService.getExam(this.examId).subscribe(exam => {
        this.calculatePoint(exam.quiz.id);
      });
    });
  }

  openVerticallyCentered(content) {
    this.modalService.open(content, {centered: true});
  }

  close() {
    this.modalService.dismissAll('');
  }
}
