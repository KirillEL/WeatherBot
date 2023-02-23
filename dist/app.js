var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Telegraf } from "telegraf";
import { config } from 'dotenv';
import fetch from 'node-fetch';
config();
class Bot {
    start_handler() {
        this.bot.start((ctx) => __awaiter(this, void 0, void 0, function* () {
            yield ctx.reply(`Привет ${ctx.from.first_name} !`);
            yield ctx.reply("Данный бот подскажет вам\nПогоду в любой точке мира! ");
        }));
    }
    choosePlaceHandler() {
        this.bot.command('choose', (ctx) => __awaiter(this, void 0, void 0, function* () {
            this.stop_listen = false;
            yield ctx.reply("Выберите Страну/Город: ")
                .then(res => {
                this.bot.on('text', (ctx) => __awaiter(this, void 0, void 0, function* () {
                    if (!this.stop_listen) {
                        this.place = ctx.message.text;
                        ctx.reply(`Вы выбрали: ${ctx.message.text}`);
                        setTimeout(() => {
                            this.sendWeatherHandler(ctx);
                        }, 1000);
                    }
                }));
            })
                .catch(rej => {
                ctx.reply("bad request");
            });
        }));
        return;
    }
    sendWeatherHandler(ctx) {
        if (this.place !== "") {
            ctx.reply("Загрузка...");
            setTimeout(() => {
                fetch(`http://api.openweathermap.org/data/2.5/weather?q=${this.place}&units=metric&appid=${process.env.WEATHER_API_TOKEN}`)
                    .then(res => res.json())
                    .then(data => {
                    //@ts-ignore
                    ctx.replyWithHTML(`<b>${data.weather[0].main}</b>\n<i>Температура: ${data.main.temp} *C</i>`);
                })
                    .catch(reject => {
                    ctx.replyWithHTML("<b>Не существует город|страна!</b>");
                });
            }, 1000);
            this.state = 0;
        }
        else {
            ctx.reply("Ошибка! Вы не выбрали город/страну!");
        }
    }
    closeHandler() {
        this.bot.command('close', (ctx) => __awaiter(this, void 0, void 0, function* () {
            this.stop_listen = true;
            yield ctx.replyWithHTML("<b>Чтобы снова узнать погоду\nнужно ввести команду /choose</b>");
        }));
    }
    constructor() {
        this.state = 0;
        this.stop_listen = false;
        this.bot = new Telegraf(process.env.BOT_TOKEN);
    }
    init() {
        this.bot.launch().then();
    }
}
const my_bot = new Bot();
my_bot.init();
my_bot.start_handler();
my_bot.choosePlaceHandler();
my_bot.closeHandler();
