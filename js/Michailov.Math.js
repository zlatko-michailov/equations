// Depends on: ["Michailov.Base.js"]

Michailov.Math = {

    Vector: {
        scale: function (vect, x) {
            "use strict"
            
            var len = vect1.length
            var scaledVect = [];
            for (var i = 0; i < len; i++) {
                scaledVect.push(vect[i] * x);
            }

            return scaledVect;
        },
        
        multiply: function (vect1, vect2) {
            "use strict"
            
            var len = this._checkLength(vect1, vect2);
            var product = 0;
            for (var i = 0; i < len; i++) {
                product += vect1[i] * vect2[i];
            }

            return product;
        },
        
        add: function (vect1, vect2) {
            "use strict"
            
            var len = this._checkLength(vect1, vect2);
            var sumVect = [];
            for (var i = 0; i < len; i++) {
                sumVect.push(vect1[i] + vect2[i]);
            }

            return sumVect;
        },
        
        subtract: function (vect1, vect2) {
            "use strict"
            
            var len = this._checkLength(vect1, vect2);
            var diffVect = [];
            for (var i = 0; i < len; i++) {
                diffVect.push(vect1[i] - vect2[i]);
            }

            return diffVect;
        },
        
        _checkLength: function (vect1, vect2) {
            "use strict"
            
            var len1 = vect1.length;
            var len2 = vect2.length;
            if (len1 != len2) throw new Error("Mismatching vector spaces.");
            
            return len1;
        },
    
    }, // Vector

    Number : {
        getSimpleCommonDenominator: function (x, y) {
            if (x == 0 || y == 0) throw new Error("No number is a denominator of 0.");
            if (x == 1 || x == -1) return y;
            if (y == 1 || y == -1) return x;
            if (x / y == Math.floor(x / y)) return x;
            if (y / x == Math.floor(y / x)) return y;
            
            return x * y;
        },
        
        sign: function (x) {
            return x == 0 ? 0: (x < 0 ? -1 : 1);
        },
        
    }, // Number

};

