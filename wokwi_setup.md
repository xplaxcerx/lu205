# Настройка проекта в Wokwi

## Компоненты:
1. **Arduino UNO**
2. **MAX7219** (4 модуля для матрицы 8x32)
3. **LED Matrix 8x32** (или 4 модуля 8x8)
4. **DHT22** (датчик температуры и влажности)

## Подключение:

### MAX7219 к Arduino:
- **VCC** → 5V
- **GND** → GND
- **DIN** → Pin 11
- **CS** → Pin 10
- **CLK** → Pin 13

### DHT22 к Arduino:
- **VCC** → 5V
- **GND** → GND
- **DATA** → Pin 2

## Библиотеки для Wokwi:
В файле `diagram.json` добавьте следующие библиотеки:
```json
{
  "version": 1,
  "author": "Your Name",
  "editor": "wokwi",
  "parts": [
    { "type": "wokwi-arduino-uno", "id": "uno" },
    { "type": "wokwi-max7219", "id": "max1" },
    { "type": "wokwi-max7219", "id": "max2" },
    { "type": "wokwi-max7219", "id": "max3" },
    { "type": "wokwi-max7219", "id": "max4" },
    { "type": "wokwi-dht22", "id": "dht1" }
  ],
  "connections": [
    [ "uno:11", "max1:DIN", "", [] ],
    [ "uno:10", "max1:CS", "", [] ],
    [ "uno:13", "max1:CLK", "", [] ],
    [ "max1:DOUT", "max2:DIN", "", [] ],
    [ "max2:DOUT", "max3:DIN", "", [] ],
    [ "max3:DOUT", "max4:DIN", "", [] ],
    [ "uno:10", "max2:CS", "", [] ],
    [ "uno:10", "max3:CS", "", [] ],
    [ "uno:10", "max4:CS", "", [] ],
    [ "uno:2", "dht1:OUT", "", [] ],
    [ "uno:5V", "max1:VCC", "", [] ],
    [ "uno:5V", "max2:VCC", "", [] ],
    [ "uno:5V", "max3:VCC", "", [] ],
    [ "uno:5V", "max4:VCC", "", [] ],
    [ "uno:5V", "dht1:VCC", "", [] ],
    [ "uno:GND", "max1:GND", "", [] ],
    [ "uno:GND", "max2:GND", "", [] ],
    [ "uno:GND", "max3:GND", "", [] ],
    [ "uno:GND", "max4:GND", "", [] ],
    [ "uno:GND", "dht1:GND", "", [] ]
  ]
}
```

## Библиотеки в коде:
В Wokwi добавьте следующие библиотеки через меню Libraries:
- **MD_Parola** by MajicDesigns
- **MD_MAX72XX** by MajicDesigns
- **DHT sensor library** by Adafruit

## Функционал:
1. **Температура**: Отображается в формате "XX.X C"
   - Анимация: выезд слева направо (PA_SCROLL_LEFT)
   - Уход наверх (PA_SCROLL_UP)

2. **Влажность**: Отображается в формате "XX.X%"
   - Анимация: выезд снизу-вверх (PA_SCROLL_UP)
   - Уход влево (PA_SCROLL_LEFT)

3. Автоматическое переключение между температурой и влажностью каждые 5 секунд


