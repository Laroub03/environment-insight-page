import { Component } from "@angular/core";
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Credentials } from "src/app/interfaces/credentials";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    ReactiveFormsModule, ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const newLogin = this.loginForm.value as Credentials;

      this.loginService.login(newLogin).subscribe(
        (response) => {
          localStorage.setItem("token", response.token);

          if (this.loginService.isLoggedInAdmin()) {
            this.router.navigate(["/adjust-rankings"]);
          } else {
            this.router.navigate(["/rankings"]);
          }
        },
        (error) => {
          this.snackBar.open("Login failed. Please check your credentials.", "Dismiss", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "bottom",
          });
        },
      );
    }
  }
}
