import {Context, Telegraf, Input, Markup} from "telegraf";
import {Update} from 'typegram';
import {config} from 'dotenv';
import fetch from 'node-fetch';


config();

class Bot {
    private bot: Telegraf<Context<Update>>;
    private place: string;
    private state: number = 0;

    start_handler(): void | undefined {
        this.bot.start(async ctx => {
            await ctx.reply(`Привет ${ctx.from.first_name} !`);
            await ctx.reply("Данный бот подскажет вам\nПогоду в любой точке мира! ");
        })
    }

    choosePlaceHandler(): void | undefined {
        this.bot.command('choose', async ctx => {
            this.state = 1;
            if (this.state === 1) {
                await ctx.reply("Выберите Страну/Город: ")
                    .then(res => {
                        this.bot.on('text', async ctx => {
                            this.place = ctx.message.text;
                            ctx.reply(`Вы выбрали: ${ctx.message.text}`);
                            setTimeout(() => {
                                this.sendWeatherHandler(ctx);
                            }, 1000);
                        })
                    })
                    .catch(rej => {
                        ctx.reply("bad request");
                    })
            }
        });
        return;
    }

    private sendWeatherHandler(ctx): void | undefined {
        if (this.place !== "") {
            ctx.reply("Загрузка...");
            setTimeout(() => {
                fetch(`http://api.openweathermap.org/data/2.5/weather?q=${this.place}&units=metric&appid=${process.env.WEATHER_API_TOKEN}`)
                    .then(res => res.json())
                    .then(data => {
                            //@ts-ignore
                            ctx.replyWithHTML(`<b>${data.weather[0].main}</b>\n<i>Температура: ${data.main.temp} *C</i>`);

                        }
                    )
                    .catch(reject => {
                        ctx.replyWithHTML("<b>Не существует город|страна!</b>");
                    })
            }, 1000);
            this.state = 0;
        } else {
            ctx.reply("Ошибка! Вы не выбрали город/страну!");
        }
    }

    constructor() {
        this.bot = new Telegraf<Context<Update>>(process.env.BOT_TOKEN);
    }

    init() {
        this.bot.launch().then();
    }
}

const my_bot: Bot = new Bot();
my_bot.init();
my_bot.start_handler();
my_bot.choosePlaceHandler();








