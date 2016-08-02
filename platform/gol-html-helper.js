function GolHtmlHelper() {

	var that = this;

	that.init = function init(settings) {
		that.settings = settings;
		that.cols = settings.cols;
		that.rows = settings.rows;
		that.colorsRGB = settings.colorsRGB;
		that.colorsHex = [that.getColorHexStr(that.colorsRGB[0]), that.getColorHexStr(that.colorsRGB[1])];
		that.powerBarMaxWidth = Math.floor(0.4 * that.settings.cols);
		that.addCssRules();
	};

	that.drawUserInterface = function drawUserInterface(armies) {
		var container, canvas;
		container = that.addContainer();
		that.addArmyLine(container, 1, armies[1]);
		canvas = that.addCanvas(container, 'gol-canvas', that.cols, that.rows);
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
		var i;
		that.addCssRule('* {box-sizing: border-box;}');
		that.addCssRule('html {height: 100%; font-size: 16px;}');
		that.addCssRule('body {height: 100%; margin: 0; overflow: hidden; background-color: #202020; color: #fff; font-family: consolas, monospace, sans-serif;}');
		that.addCssRule('#load-src-panel {margin-top: 100px; margin-left: calc(50% - 200px); width: 400px; text-align: center}');
		that.addCssRule('#load-src-button {border: 1px solid #666; background: #666; color: #fff; font-family: consolas, monospace, sans-serif; font-size: 16px; cursor: pointer; outline: none;}');
		that.addCssRule('#gol-container {height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;}');
		that.addCssRule('#gol-canvas {background-color: #000; cursor: crosshair; margin: 5px;}');
		for (i = 0; i < 2; i++) {
			that.addCssRule('#src-' + i + ' {margin-bottom: 10px; border: 1px solid #666; width: 100%; background-color: #000; padding-left: 3px; font-family: consolas, monospace, sans-serif; font-size: 10px; color: #' + that.colorsHex[i] + ';}');
			that.addCssRule('#gol-army-line-' + i + ' {display: flex; justify-content: space-between; align-items: center; height: 20px; width: ' + that.cols + 'px; position:relative;}');
			that.addCssRule('#gol-army-name-' + i + ' {height: 20px; width: 50%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #' + that.colorsHex[i] + ';}');
			that.addCssRule('#gol-army-stats-' + i + ' {height: 20px; display: flex; align-items: center;}');
			that.addCssRule('#gol-army-score-' + i + ' {height: 20px; color: #' + that.colorsHex[i] + ';}');
			that.addCssRule('#gol-army-power-' + i + ' {height: 3px; margin-left: 2px; background-color: #' + that.colorsHex[i] + '; box-shadow: 0px 0px 10px #' + that.colorsHex[i] +'; transition: 1s width ease;}');
		}
	};

	that.addContainer = function addContainer() {
		var container;
		container = document.createElement('div');
		container.setAttribute('id', 'gol-container');
		return document.body.appendChild(container);
	};

	that.addArmyLine = function addArmyLine(container, index, army) {
		var textNode, armyLine, armyName, armyStats, armyPower, armyScore;
		armyLine = document.createElement('div');
		armyLine.setAttribute('id', 'gol-army-line-' + index);

		armyName = document.createElement('div');
		armyName.setAttribute('id', 'gol-army-name-' + index);
		textNode = document.createTextNode(army.name);
		armyName.appendChild(textNode);

		armyLine.appendChild(armyName);		

		armyStats = document.createElement('div');
		armyStats.setAttribute('id', 'gol-army-stats-' + index);

		armyScore = document.createElement('div');
		armyScore.setAttribute('id', 'gol-army-score-' + index);
		textNode = document.createTextNode('' + that.settings.powerMaxValue);
		armyScore.appendChild(textNode);
		armyStats.appendChild(armyScore);

		armyPower = document.createElement('div');
		armyPower.setAttribute('id', 'gol-army-power-' + index);
		armyPower.style['width'] = that.powerBarMaxWidth + 'px';
		armyStats.appendChild(armyPower);

		armyLine.appendChild(armyStats);

		return container.appendChild(armyLine);
	};

	that.addCanvas = function addCanvas(container, id, width, height) {
		var canvas;
		canvas = document.createElement('canvas');
		canvas.setAttribute('id', id);
		canvas.setAttribute('width', width + 'px');
		canvas.setAttribute('height', height + 'px');
		return container.appendChild(canvas);
	};

	that.drawArrayToCanvas = function drawArrayToCanvas(array, newPixels, newPixelsAge, scoringPixelCount, armies, gameEnded) {
		var i, j, k, x, y, r, g, b, a, maxAge, maxDistance, multiplier, distance, index, imgData;
		imgData = that.ctx.createImageData(that.cols, that.rows);
		
		// regular matrix
		for (y = 0; y < that.rows; y++) {
			for (x = 0; x < that.cols; x++) {
				i = y * that.cols + x;
				if (array[i] === -1) {
					imgData.data[i * 4] = imgData.data[i * 4 + 1] = imgData.data[i * 4 + 2] = 0;
				} else {
					imgData.data[i * 4] = that.colorsRGB[array[i]][0];
					imgData.data[i * 4 + 1] = that.colorsRGB[array[i]][1];
					imgData.data[i * 4 + 2] = that.colorsRGB[array[i]][2];
				}
				imgData.data[i * 4 + 3] = 255;
			}
		}

		// back line
		for (i = 0; i < 2; i++) {
			y = (i === 0) ? that.rows-1 : 0;
			for (x = 0; x < that.cols; x++) {
				index = y * that.cols + x;
				if (array[index] === -1) {
					if (gameEnded) {
						if (armies[i].power !== 0 || armies[0].power === 0 && armies[1].power === 0) {
							// draw
							r = that.colorsRGB[i][0];
							g = that.colorsRGB[i][1];
							b = that.colorsRGB[i][2];
							a = Math.floor(Math.random() * 255);
						} else if (armies[i].power === 0) {
							r = that.colorsRGB[i * -1 + 1][0];
							g = that.colorsRGB[i * -1 + 1][1];
							b = that.colorsRGB[i * -1 + 1][2];
							a = Math.floor(Math.random() * 255);
						}
					} else {
						// regular back line
						if (scoringPixelCount[i * -1 + 1] === 0) {
							r = that.colorsRGB[i][0];
							g = that.colorsRGB[i][1];
							b = that.colorsRGB[i][2];
							a = Math.floor(Math.random() * 255);
						} else {
							// hit
							r = g = b = a = 255;
						}
					}
					imgData.data[index * 4] = r;
					imgData.data[index * 4 + 1] = g;
					imgData.data[index * 4 + 2] = b;
					imgData.data[index * 4 + 3] = a;
				}
			}
		}

		// new pixels mark
		maxAge = 5;		
		for (i = 0; i < newPixels.length; i++) {
			for (j = 0; j < newPixels[i].length; j++) {
				if (newPixelsAge[i] <= maxAge) {
					maxDistance = Math.floor(64 / newPixelsAge[i]);
					multiplier = Math.floor(256 / maxDistance);
					for (k = 0; k < that.rows; k++) {
						distance = Math.abs(k - newPixels[i][j][1]);
						if (distance < maxDistance) {
							index = k * that.cols + newPixels[i][j][0];
							if (array[index] === -1) {
								imgData.data[index * 4] = that.colorsRGB[i][0];
								imgData.data[index * 4 + 1] = that.colorsRGB[i][1];
								imgData.data[index * 4 + 2] = that.colorsRGB[i][2];
								imgData.data[index * 4 + 3] = (1 / newPixelsAge[i]) * (maxDistance - distance) * multiplier - 1;
							}
						}
					}
					for (k = 0; k < that.cols; k++) {
						distance = Math.abs(k - newPixels[i][j][0]);
						if (distance < maxDistance) {
							index = newPixels[i][j][1] * that.cols + k;
							if (array[index] === -1) {
								imgData.data[index * 4] = that.colorsRGB[i][0];
								imgData.data[index * 4 + 1] = that.colorsRGB[i][1];
								imgData.data[index * 4 + 2] = that.colorsRGB[i][2];
								imgData.data[index * 4 + 3] = (1 / newPixelsAge[i]) * (maxDistance - distance) * multiplier - 1;
							}
						}
					}
				}	
			}
		}

		// new pixels
		for (i = 0; i < newPixels.length; i++) {
			if (newPixelsAge[i] <= maxAge) {
				for (j = 0; j < newPixels[i].length; j++) {
					index = newPixels[i][j][1] * that.cols + newPixels[i][j][0];
					imgData.data[index * 4] = imgData.data[index * 4 + 1] = imgData.data[index * 4 + 2] = imgData.data[index * 4 + 3] = 255;
				}
			}
		}

		that.ctx.putImageData(imgData, 0, 0);
	};

	that.updateScore = function updateScore(armyIndex, armyPower, scoringPixels) {
		var score, scoreText, powerWidth;
		document.getElementById('gol-army-score-' + armyIndex).style['color'] = (scoringPixels === 0) ? '#' + that.colorsHex[armyIndex] : '#fff';		
		document.getElementById('gol-army-power-' + armyIndex).style['background-color'] = (scoringPixels === 0) ? '#' + that.colorsHex[armyIndex] : '#fff';
		score = Math.round(armyPower);
		if (score === 0 && armyPower > 0) {
			score = 1;
		}
		scoreText = '' + score;
		document.getElementById('gol-army-score-' + armyIndex).innerHTML = scoreText;		
		powerWidth = Math.round(armyPower / that.settings.powerMaxValue * that.powerBarMaxWidth);
		if (powerWidth === 0 && armyPower > 0) {
			powerWidth = 1;
		}
		document.getElementById('gol-army-power-' + armyIndex).style['width'] = powerWidth + 'px';
	};

	that.endGame = function endGame()  {
		var i;
		for (i = 0; i < 2; i++) {
			document.getElementById('gol-army-score-' + i).style['color'] = '#' + that.colorsHex[i];		
			document.getElementById('gol-army-power-' + i).style['background-color'] = '#' + that.colorsHex[i];
		}
	};

}
