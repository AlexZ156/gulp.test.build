# P2H gulp build

Версия node.js должна быть не ниже 4-й
например
`node -v`
![](https://s3.amazonaws.com/scrstorage/u52whm73f3jm8619891j5.jpg)

Версия npm должна быть не ниже 3-й
например
`npm -v`
![](https://s3.amazonaws.com/scrstorage/5273l2289x46hv9c17.jpg)

В данный момент работают эти версии Gulp.
![](https://s3.amazonaws.com/scrstorage/5h28018x17r5v87dyv47.jpg)

Далее качаем себе сборку. **Далее работаем в корне папки `markup`!!! путь в терминале должен быть такого рода `D:\gulp.test.build\markup> npm i`** После того как скачали сборку устанавливаем npm пакеты для этой сборки `npm install` или просто `npm i`.

![](https://s3.amazonaws.com/scrstorage/p52770715657yf76.jpg)

Пакеты устанавливаются лишь один раз для конкретной сборки.

Когда всё установилось, то можно уже использовать сборку. Основные команды:

- `gulp` - запустить проект
- `gulp dist` - выполнить перед постановкой на QA. Форматируется css в "красивый" вид, ужимаются картинки, удаляются source мапы
- `gulp build` - пока эта команда чистит лишние скрипты из папки `markup/js`

Все препроцессоры находятся в папке `assets`. Всё что не js файл и всё что не препроцессор и не картинки, например фотны, видел или какие-то inc файлы, то забрасываем в корень папочки `markup`. Т.е:

***
- JS с билдера забрасываем сюда

![](https://s3.amazonaws.com/scrstorage/d52w89788o607x480.jpg)

- картинки сюда

![](https://s3.amazonaws.com/scrstorage/ly529066735u187dr0.jpg)

- scss

![](https://s3.amazonaws.com/scrstorage/g52910356t7495t0.jpg)

- странички `.pug` он же в прошлом `.jade` вкорень папки `assets`

![](https://s3.amazonaws.com/scrstorage/u5fd291u9941j45124.jpg)

- Все `.pug` темплейты, миксины

![](https://s3.amazonaws.com/scrstorage/52q925lu101i9w4281.jpg)






`npm install -g sass-lint`
`SublimeLinter-contrib-sass-lint`

