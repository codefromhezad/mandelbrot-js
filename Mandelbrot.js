
var TO_LN2 = 1.0 / Math.LN2;
var CONVERGENCE_RADIUS = 4;
var CONVERGENCE_RADIUS_SQ = CONVERGENCE_RADIUS * CONVERGENCE_RADIUS;

function log2(p) {
    return Math.log(p) * TO_LN2;
}

function Mandelbrot(canvas_id) {

    this.palette = [];
    this.coordsMap = [];
    
    this.element = document.getElementById(canvas_id);
    this.context = this.element.getContext("2d");

    this.width  = this.element.width*2;
    this.height = this.element.height*2;

    this.paletteMultiplier = 1;
    this.paletteOffset = 512;

    this.fractalFunc = Plugins.mandelbrot_orbit_trap.iterator;

    this.is_preview = false;

    this.buildDefaultPalette = function() {
        var palette_size = 512;

        for(var p = 0; p < palette_size; p++) {
            var r = 127 + (255 - 127) * p / palette_size;
            var g = 36 + (212 - 36) * p / palette_size;
            var b = 0 + (80 - 0) * p / palette_size;
            
            this.palette[p] = [ r, g, b ];
        }

        for(var p = 0; p < palette_size; p++) {
            var r = 127 + (255 - 127) * (1 - p / palette_size);
            var g = 36 + (212 - 36) * (1 - p / palette_size);
            var b = 0 + (80 - 0) * (1 - p / palette_size);
            
            this.palette[p + palette_size] = [ r, g, b ];
        }
    }

    this.setFractalFunction = function(func) {
        this.fractalFunc = func;
    }

    this.getPaletteColor = function(p) {
        if(p < 0) {
            return [0, 0, 0];
        }

        return this.palette[ Math.floor( Math.max(0, this.paletteMultiplier * p * this.palette.length + this.paletteOffset)) % (this.palette.length - 1) | 0 ];
    }

    this.canvasToFractalCoords = function(p) {
        var scale = 2;

        if( this.is_preview ) {
            scale = 1;
        }

        return this.coordsMap[p.y * scale | 0][p.x * scale | 0];
    }

    this.render = function(scale, px, py, preview) {
        if( preview ) {
            this.is_preview = true;

            this.width  = this.element.width;
            this.height = this.element.height;

            var _width  = 1.0 / this.width;
            var _height = 1.0 / this.height;

            var imageData = this.context.createImageData(this.width | 0, this.height | 0);
        } else {

            var _width  = 1.0 / this.width;
            var _height = 1.0 / this.height;

            var imageData = this.context.createImageData(this.width * 0.5 | 0, this.height * 0.5 | 0);
        }

        var scale_2 = scale / 2;
        var scale_h = _height * scale;
        var scale_w = _width * scale;

        var iterationsMap = [];
        var maxMapValue = 0;

        if( ! this.palette.length ) {
            this.buildDefaultPalette();
        }

        // First pass
        var y = py - scale_2;

        for (var j = 0; j < this.height; j++) {
            
            var x = px - scale_2;

            this.coordsMap[j] = [];
            iterationsMap[j] = [];

            for (var i = 0; i < this.width; i++) {
                
                this.coordsMap[j][i] = {x: x, y: y};

                iterationsMap[j][i] = this.fractalFunc(x, y);
                
                if( iterationsMap[j][i] > maxMapValue ) {
                    maxMapValue = iterationsMap[j][i];
                }

                x += scale_w;
            }

            y += scale_h;
        }
        
        // Second pass. Actual rendering
        var imgIndex = 0;
        var screenIter = 2;

        if( preview ) {
            screenIter = 1;
        }
        for (var j = 0; j < this.height; j+=screenIter) {
            for (var i = 0; i < this.width; i+=screenIter) {

                var p = this.getPaletteColor(iterationsMap[j][i]);
                
                if( ! preview ) {
                    var p2 = this.getPaletteColor(iterationsMap[j][i+1]);
                    var p3 = this.getPaletteColor(iterationsMap[j+1][i]);
                    var p4 = this.getPaletteColor(iterationsMap[j+1][i+1]);

                    var r = ((p[0] + p2[0] + p3[0] + p4[0]) * 0.25) | 0;
                    var g = ((p[1] + p2[1] + p3[1] + p4[1]) * 0.25) | 0;
                    var b = ((p[2] + p2[2] + p3[2] + p4[2]) * 0.25) | 0;
                } else {
                    var r = p[0];
                    var g = p[1];
                    var b = p[2];
                }

                imageData.data[imgIndex++] = r;
                imageData.data[imgIndex++] = g;
                imageData.data[imgIndex++] = b;
                imageData.data[imgIndex++] = 255;
            }
        }

        this.context.putImageData(imageData, 0, 0);
    }
}