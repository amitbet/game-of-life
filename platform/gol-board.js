function GolBoard() {

	var that = this;

	that.init = function init(settings) {
		var i;
		that.settings = settings;
		that.cols = settings.cols;
		that.rows = settings.rows;
		that.points = that.cols * that.rows;
		that.vectors = [[], []];
		for (i = 0; i < that.points; i++) {
			that.vectors[0][i] = that.vectors[1][i] = -1;
		}
	};

	// that.copyVectorValues = function copyVectorValues(srcVector, dstVector) {
	// 	var i;
	// 	for (i = 0; i < that.points; i++) {
	// 		dstVector[i] = srcVector[i];
	// 	}
	// };

	// that.ageVectorValues = function ageVectorValues(vector) {
	// 	var i;
	// 	for (i = 0; i < that.points; i++) {
	// 		if (vector[i] > that.ageQuantum) {
	// 			vector[i] -= that.ageQuantum;
	// 		} else {
	// 			vector[i] = 0;
	// 		}
	// 	}
	// }

	// that.addRandomLife = function addRandomLife(vector) {
	// 	var n, x, y, r, c;
	// 	if (Math.floor(Math.random() * 10 + 1) === 1) {
	// 		r = Math.floor(Math.random() * (that.rows - 3) + 2);
	// 		c = Math.floor(Math.random() * (that.cols - 3) + 2);
	// 		for (y = r - 2; y <= r + 2; y++) {
	// 			for (x = c - 2; x <= c + 2; x++) {
	// 				vector[y * that.cols + x] = (Math.floor(Math.random() * 2 + 1) === 1) ? 1 : 0;
	// 			}
	// 		}
	// 	}
	// }

	that.getIndex = function getIndex(x, y) {
		return y * that.cols + x;
	};

	that.getX = function getX(index) {
		return index % that.cols;
	};

	that.getY = function getY(index) {
		return Math.floor(index / that.cols);
	};

	that.getAdjacentIndexes = function getAdjacentIndexes(index) {
		var indices = [],
			x = index % that.cols,
			y = Math.floor(index / that.cols),
			cols = that.cols,
			rows = that.rows;
		if ((y - 1) >= 0 && (x - 1) >= 0) {
			indices.push((y - 1) * cols + (x - 1));
		}
		if ((y - 1) >= 0) {
			indices.push((y - 1) * cols + (x));
		}
		if ((y - 1) >= 0 && (x + 1) <= (cols - 1)) {
			indices.push((y - 1) * cols + (x + 1));
		}
		if ((x - 1) >= 0) {
			indices.push((y) * cols + (x - 1));
		}
		if ((x + 1) <= (cols - 1)) {
			indices.push((y) * cols + (x + 1));
		}
		if ((y + 1) <= (rows - 1) && (x - 1) >= 0) {
			indices.push((y + 1) * cols + (x - 1));
		}
		if ((y + 1) <= (rows - 1)) {
			indices.push((y + 1) * cols + (x));
		}
		if ((y + 1) <= (rows - 1) && (x + 1) <= (cols - 1)) {
			indices.push((y + 1) * cols + (x + 1));
		}
		return indices;
	};

	that.getAdjacentIndexesByXY = function getAdjacentIndexesByXY(x, y) {
		return that.getAdjacentIndexes(y * that.cols + x);
	};

	that.computeNextState = function computeNextState(vector1, vector2) {
		var i, a, j, n, v, c0, adjacents;
		for (i = 0; i < that.points; i++) {
			n = 0;
			c0 = 0;
			adjacents = that.getAdjacentIndexes(i);
			for (a = 0; a < adjacents.length; a++) {
				j = adjacents[a];
				if (vector1[j] === 0) {
					n++;
					c0++;
				} else if (vector1[j] === 1) {
					n++;
				}
			}
			v = vector1[i];
			if ((v === 0 || v === 1) && (n < 2 || n > 3))  {
				vector2[i] = -1;
			} else if (v === -1 && n === 3) {
				vector2[i] = (c0 >= 2) ? 0 : 1;
			} else {
				vector2[i] = v;
			}
		}
	};

	// that.makeRandomChange = function makeRandomChange(vector) {
	// 	for (var i = 0; i < 100; i++) {
	// 		vector[Math.floor(Math.random() * that.points)] = -1;	
	// 	}
	// };

	that.adjustNewPixels = function adjustNewPixels(pixels) {
		var i, j, v, x, y, adjustedPixels;
		adjustedPixels = [[],[]];
		for (i = 0; i < pixels.length; i++) {
			for (j = 0; j < pixels[i].length; j++) {
				x = pixels[i][j][0];
				y = i === 0 ? that.rows / 2 + pixels[i][j][1] : that.rows / 2 - 1 - pixels[i][j][1];
				if (x < 0 || x >= that.cols || y < 0 || y >= that.rows) {
					_err('New pixel out of range! ArmyIndex: ' + i + ', X: ' + pixels[i][j][0] + ', Y: ' + pixels[i][j][1]);	
				} else {
					adjustedPixels[i].push([x,y]);
				}
			}	
		}
		return adjustedPixels;
	};

	that.getNewPixelIndices = function getNewPixelIndices(pixels) {
		var i, j, v, pixelIndices;
		pixelIndices = [[],[]];
		for (i = 0; i < pixels.length; i++) {
			for (j = 0; j < pixels[i].length; j++) {
				v = (i == 0)
				? that.getIndex(pixels[i][j][0], that.rows / 2 + pixels[i][j][1])
				: that.getIndex(pixels[i][j][0], that.rows / 2 - 1 - pixels[i][j][1]);
				if (v < 0 || v > that.points) {
					_err('new pixel out of range');
				} else {
					pixelIndices[i][j] = v; 
				}
			}	
		}
		return pixelIndices;
	};

	that.placeNewPixelsOnBoard = function placeNewPixelsOnBoard(vector, pixels) {
		var i, j;
		for (i = 0; i < pixels.length; i++) {
			for (j = 0; j < pixels[i].length; j++) {
				vector[pixels[i][j][1] * that.cols + pixels[i][j][0]] = i;	
			}
		}	
	}

	that.handleWinningPixels = function handleWinningPixels(vector) {
		var a, r, c, i, adjs, j;
		var winningPixels = [0, 0];
		for (a = 0; a < 2; a++) {
			r = a === 0 ? 0 : that.rows - 1;
			for (c = 0; c < that.cols; c++) {
				i = that.getIndex(c, r);
				if (vector[i] === a) {
					winningPixels[a]++;
					vector[i] = -1;
					adjs = that.getAdjacentIndexes(i);
					for (j = 0; j < adjs.length; j++) {
						if (vector[adjs[j]] === a) {
							vector[adjs[j]] = -1;
						}
					}
				}
			}
		}
		return winningPixels;		
	};

}