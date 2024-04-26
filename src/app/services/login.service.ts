import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Credentials } from "../interfaces/credentials";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private http: HttpClient) {}

  login(credentials: Credentials): Observable<any> {
    return this.http.post<Credentials>("/login", credentials);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem("token");
    return !!token; // Returns true if token the token exists.
  }

  isLoggedInAdmin(): boolean {
    const token = localStorage.getItem("token");

    const user = this.getUser();

    return !!token && user === "admin";
  }

  getUser(): string | null {
    const token = localStorage.getItem("token");

    // Check if the token exists
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.user;
    }

    return null;
  }
}
