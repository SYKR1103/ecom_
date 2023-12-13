import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-facebook";
import { UserService } from "src/user/user.service";





@Injectable()

export class FacebookAuthStrategy extends PassportStrategy(
    Strategy,
    "facebook") {

    constructor(
        private readonly configService : ConfigService,
        private readonly userService : UserService,
    ) {

        super({
            clientID : configService.get("META_AUTH_CLIENTID"),
            clientSecret : configService.get("META_AUTH_CLIENT_SECRET"),
            callbackURL : configService.get("META_AUTH_CALLBACK_URL"),
            profileFields: ['emails', 'name']

        })

    }

    async validate(
        _accesstoken : string,
        _refreshtoken : string,
        profile : Profile,
        done : any,

    ) : Promise<any> {

        const {email, last_name, first_name} = profile._json
        const {provider} = profile

        try {

            const user = await this.userService.findUserByEmail(email)
            
            if (user.provider !== provider) {
                throw new HttpException("already signed up",HttpStatus.BAD_REQUEST )
            } 

            done(null, user)

        } catch(e) {

            if (e.status === 404) {
                const newuser = await this.userService.createUser({

                    nickname: first_name + last_name,
                    email,
                    provider

                })
                done(null, newuser)
            }
        }

    }

}