// Depends on: []

var Michailov = {

    Options: {
        debugEnabled: false,
        edition: 0,
    },


    Debug: {
        clear: function () {
            if (Michailov.Options.debugEnabled) {
                this.getDebugElement().innerHTML = "";
            }
        },

        write: function (html) {
            if (Michailov.Options.debugEnabled) {
                this.getDebugElement().innerHTML += html;
            }
        },

        writeLine: function (html) {
            if (Michailov.Options.debugEnabled) {
                this.write(html);
                this.write(" <br /> ");
            }
        },

        getDebugElement: function () {
            if (this._debugElement == null) {
                this._debugElement = document.getElementById("Debug");
            }

            return this._debugElement;
        },

        _debugElement: null,
    },

};


