import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { NavigateService } from '../services/navigate.service';
import { RegisterService } from './services/register.service';
import * as _ from 'lodash';
import { randomNum } from 'src/assets/util/randomNum';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private service: RegisterService,
    private navigate: NavigateService,
    private errorService: ErrorService
  ) {}

  registrar = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(7)]],
    senha: ['', [Validators.required, Validators.minLength(7)]],
    email: ['', [Validators.required, Validators.email]],
    nome: ['', [Validators.required, Validators.minLength(7)]],
    imagem: ['', []]
  });

  // pega as opções
  options$ = this.service
    .getOptions('options-register')
    .pipe(catchError(async () => this.errorService.trazerErro()));

  emailEnviado: boolean = false;
  uploadedFile = false;
  arquivo: any;

  // gera um código, envia o email e navega pro ultimo passo
  cadastrar() {
    this.service.cod = randomNum(100000, 999999);
    this.service
      .enviaEmailRegister(this.registrar.get('email')?.value, this.service.cod)
      .subscribe(() => {
        this.navigate.navegarParaLastStep(this.getPayload());
      });
  }

  voltarInicio() {
    this.navigate.navegarParaLogin();
  }

  verificaErro(optionName: string) {
    const erros: any = {
      required: 'Campo invalido!',
      minLength: 'Campo invalido!',
      jaExiste: `${optionName} já existe!`,
      erroConsulta: 'Houve um erro na consulta!'
    }
    return erros[Object.keys(this.registrar.get(optionName)?.errors as Object)[0]]
  }

  // adiciona os filtros de erro
  adicionarFiltros(
    abstractControl: AbstractControl,
    filtro: number,
    userOrEmail: string
  ) {
    return abstractControl?.valueChanges
      .pipe(
        debounceTime(500),
        filter((valor) => valor >= filtro || valor.length),
        distinctUntilChanged(),
        userOrEmail === 'user'
          ? switchMap((valor) => this.service.getUser(valor))
          : switchMap((valor) => this.service.getUserByEmail(valor))
      )
      .subscribe({
        next: (valor) => {
          _.isEmpty(valor) ? '' : abstractControl.setErrors({ jaExiste: true });
        },
        error: () => {
          abstractControl.setErrors({ erroConsulta: true });
        },
      });
  }

  getPayload(){
    return {
      usuario: this.registrar.value.usuario,
      senha: this.registrar.value.senha,
      email: this.registrar.value.email,
      nomeUsuario: this.registrar.value.nome
    }
  }

  tokenValid(): any {
    return this.service.getOptions('options-register');
  }

  ngOnInit(): void {
    this.adicionarFiltros(
      this.registrar.get('usuario') as AbstractControl,
      7,
      'user'
    );
    this.adicionarFiltros(
      this.registrar.get('email') as AbstractControl,
      7,
      'email'
    );
  }
}
