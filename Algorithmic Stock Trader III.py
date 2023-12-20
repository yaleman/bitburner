#!/usr/bin/env python3

stocklist = [57,65,162,140,142,21,71,141,39,4,26,20,99,200,24,152,111,23,184,88,143,76,64,145,187,143,194,73,93,63,181,134,171,133,123,15,]

for index, element in enumerate(stocklist):
    if index < len(stocklist)-1:
        diff = element - stocklist[index+1]
        print(diff)
