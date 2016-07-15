function GolHtmlHelper() {

	var that = this;

	that.init = function init(settings) {
		that.settings = settings;
		that.cols = settings.cols;
		that.rows = settings.rows;
		that.colorsRGB = settings.colorsRGB;
		that.addCssRules();
	};

	that.drawUserInterface = function drawUserInterface(armies) {
		var container, canvas;
		container = that.addContainer();
		that.addArmyLine(container, 1, armies[1]);
		canvas = that.addCanvas(container);
  		that.addArmyLine(container, 0, armies[0]);
		that.ctx = canvas.getContext('2d');
	};

	that.getColorHexStr = function getColorHexStr(colorRGBArray) {
		return colorRGBArray[0].toString(16) + colorRGBArray[1].toString(16) + colorRGBArray[2].toString(16);
	};

	that.addCssRule = function addCssRule(cssText) {
		var style;
		style = document.createElement('style');
		style.type = 'text/css';
		if (style.styleSheet) {
			style.styleSheet.cssText = cssText;
		} else {
			style.appendChild(document.createTextNode(cssText));
		}
		document.head.appendChild(style);
	};

	that.addCssRules = function addCssRules() {
		var colorsHex = [that.getColorHexStr(that.colorsRGB[0]), that.getColorHexStr(that.colorsRGB[1])];
		that.addCssRule('* {box-sizing: border-box;}');
		that.addCssRule('html {height: 100%;}');
		that.addCssRule('body {height: 100%; margin: 0; overflow: hidden; background-color: #222; color: #FFF; font-family: consolas, monospace, sans-serif; font-size: 16px;}');
		that.addCssRule('#gol-container {height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;}');
		that.addCssRule('#gol-canvas {background-color: #000000; border-bottom: 1px solid #' + colorsHex[0] + '; border-top: 1px solid #' + colorsHex[1] + ';}');
		that.addCssRule('#gol-army-line-0 {margin: 5px; color: #' + colorsHex[0] + ';}');
		that.addCssRule('#gol-army-line-1 {margin: 5px; color: #' + colorsHex[1] + ';}');
	};

	that.addContainer = function addContainer() {
		var container;
		container = document.createElement('div');
		container.setAttribute('id', 'gol-container');
		return document.body.appendChild(container);
	};

	that.addArmyLine = function addArmyLine(container, index, army) {
		var textNode, armyLine;
		armyLine = document.createElement('div');
		armyLine.setAttribute('id', 'gol-army-line-' + index);
		textNode = document.createTextNode(army.name + ' : ' + army.score);
		armyLine.appendChild(textNode);
		return container.appendChild(armyLine);
	};

	that.addCanvas = function addCanvas(container) {
		var canvas;
		canvas = document.createElement('canvas');
		canvas.setAttribute('id', 'gol-canvas');
		canvas.setAttribute('width', that.cols + 'px');
		canvas.setAttribute('height', that.rows + 'px');
		return container.appendChild(canvas);
	};

	that.drawVectorToCanvas = function drawVectorToCanvas(vector, newPixels) {
		var i, j, k, x, y, index, imgData;
		imgData = that.ctx.createImageData(that.cols, that.rows);
		for (y = 0; y < that.rows; y++) {
			for (x = 0; x < that.cols; x++) {
				i = y * that.cols + x;
				if (vector[i] === -1) {
					imgData.data[i * 4] = imgData.data[i * 4 + 1] = imgData.data[i * 4 + 2] = 0;
				} else {
					imgData.data[i * 4] = that.colorsRGB[vector[i]][0];
					imgData.data[i * 4 + 1] = that.colorsRGB[vector[i]][1];
					imgData.data[i * 4 + 2] = that.colorsRGB[vector[i]][2];
				}
				imgData.data[i * 4 + 3] = 255;
			}
		}
		for (i = 0; i < newPixels.length; i++) {
			for (j = 0; j < newPixels[i].length; j++) {
				for (k = 0; k < that.rows; k++) {
					index = k * that.cols + newPixels[i][j][0];
					imgData.data[index * 4] = that.colorsRGB[i][0];
					imgData.data[index * 4 + 1] = that.colorsRGB[i][1];
					imgData.data[index * 4 + 2] = that.colorsRGB[i][2];
					imgData.data[index * 4 + 3] = 64;
				}
				for (k = 0; k < that.cols; k++) {
					index = newPixels[i][j][1] * that.cols + k;
					imgData.data[index * 4] = that.colorsRGB[i][0];
					imgData.data[index * 4 + 1] = that.colorsRGB[i][1];
					imgData.data[index * 4 + 2] = that.colorsRGB[i][2];
					imgData.data[index * 4 + 3] = 64;
				}	
			}
		}
		that.ctx.putImageData(imgData, 0, 0);
	};

	that.updateScores = function updateScores(armies) {
		var i;
		for (i = 0; i < armies.length; i++) {
			document.getElementById('gol-army-line-' + i).innerHTML = armies[i].name + ' : ' + armies[i].score;		
		}
	};

}