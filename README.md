# Информация о проекте.

Название проекта: slider_ui.

Описание:
Slider_ui, это многофукциональный слайдер, созданный в качестве учебного проекта для компании FSD.
Он является плагином для популярной библиотеки jQuery, поэтому для его корректной работы
вам предварительно потребуется установить ее.

**Установка.**
1. Скопируйте файлы находящиеся в репозитории в папку вашего проекта.
2. Выполните команду npm install для установки зависимостей.
3. Выполните команду npm run start/npm run build для запуска слайдера в режиме разработки/сборки проекта.

**Создание слайдера.**

Для создания слайдера выполните команду `$().slider(configuration)`.
`configuration` выступает параметром слайдера и является объектом.

Для создания слайдера с натройками по умолчанию, вам потребуется передать объект
с одним свойством - **id**, в формате `#id`.

Данная команда приведет к созданию слайдера в качестве дочернего элемента узла с идентификатором **id**.

**Конфигурационный файл**

Для инициализации слайдера с настройками по умолчанию, вам достаточно передать в качестве аргумента объект со свойством id.
Также, в объекте вы можете указать дополнительные настройки. Это позволит вам переопределить настройки заданные по умолчанию.

В конфигурационном файле вы можете определить следующие свойства:

1. Минимальное значение `minValue: number`. Значение по умолчанию: `minValue: 0`.
2. Максимальное значение ` maxValue: number`. Значение по умолчанию: `maxValue: 100`.
3. Количество шагов `steps: number`. Значение по умолчанию: `steps: 0`.
4. Количество бегунков и их позиция `runners: []`. Значение по умолчанию: `runners: [0]`.
5. Включить/Выключить шаги `stepsOn: boolean,`. Значение по умолчанию: `stepsOn: false`.
6. Вертикальное отображение `vertical?: boolean`. Значение по умолчанию: `vertical: false`.
7. Включить/Выключить линейку `scaleOn: boolean`. Значение по умолчанию: `scaleOn: true`.
8. Идентификатор родительского элемента `id: string`. Значение по умолчанию: `id: undefined`.
9. Показать/Скрыть панель управления `panel: boolean`. Значение по умолчанию: `panel: false`.
10. Показать/Скрыть подсказки над бегунков `tooltips: boolean`. Значение по умолчанию: `tooltips: true`.




Для настройки слайдера под ваши нужды, при его инициализации вам потребуется передать ему конфигурационный файл в формате объекта.
Конфигурационный файл должен соддержать только одно обязательное поле - **id**. Все остальные поля являются необязательными.

В конфигурационный файл вы можете передать следующие настройки:

1. Минимальное значение `minValue: number`.
2. Максимальное значение ` maxValue: number`.
3. Количество шагов `steps: number`.
4. Количество бегунков и их позиция `runners: []`
5. Включить/Выключить шаги `stepsOn: boolean,`
6. Вертикальное отображение `vertical?: boolean`
7. Включить/Выключить линейку `scaleOn: boolean`
8. Идентификатор родительского элемента `id: string`
9. Показать/Скрыть панель управления `panel: boolean`
10. Показать/Скрыть подсказки над бегунков `tooltips: boolean`.ж


[Demonstration](https://ivanushkapr.github.io/slider/index.html)
