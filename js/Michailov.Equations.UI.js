// Depends on: ["Michailov.Base.js", "Michailov.Equations.js", "Michailov.Equations.Constraints.js"]

Michailov.Equations.UI = {
    onPageLoad: function() {
        "use strict"

        document.getElementById("appEdition").innerHTML = Michailov.Equations.Constraints.appEdition;
        document.getElementById("appVersion").innerHTML = Michailov.Equations.Constraints.appVersion;

        var bodyHeight = document.body.clientHeight - document.getElementById("header").offsetHeight - document.getElementById("footer").offsetHeight - 100;
        var bodyStyle = document.getElementById("body").style;
        bodyStyle += "; height: " + bodyHeight + "px";
        document.getElementById("body").setAttribute("style", bodyStyle);
    },

    onStartPageLoad: function() {
        "use strict" 

        this.onPageLoad();
    },

    problemEnabled: function() {
        "use strict" 
        
        var params = JSON.parse(window.location.hash.substring(1));
        if (params != null) {
            var constraints = Michailov.Equations.Constraints;
            
            if (params.rank <= constraints.maxRank) {
                Michailov.Equations.Params.rank = params.rank;
                Michailov.Equations.Params.coeffLimit = params.coeffLimit;
            
                return true;
            }
        }
        
        return false;
    },
    
    onProblemPageLoad: function() {
        "use strict" 
        
        this.onPageLoad();
        
        if (this.problemEnabled()) {
            this.showNewProblem();
        }
    },

    showNewProblem: function () {
        "use strict"
        
        if (this.problemEnabled()) {
            this.problemChanged = true;

            this.hideAnswer();
            this.hideSolution();

            var problemParentElement = this.getProblemParentElement();
            Michailov.Equations.View.showNewProblem(problemParentElement);
        }
    },

    showAnswer: function () {
        "use strict"
        
        var answerParentElement = this.getAnswerParentElement();
        Michailov.Equations.View.showAnswer(answerParentElement);
        answerParentElement.setAttribute("class", "visible");
        
        var answerButtonElement = this.getAnswerButtonElement();
        answerButtonElement.innerHTML = this.hideButtonTitle;
        answerButtonElement.onclick = function () { Michailov.Equations.UI.hideAnswer(); };
    },
    
    hideAnswer: function () {
        "use strict"
        
        var answerParentElement = this.getAnswerParentElement();
        answerParentElement.setAttribute("class", "hidden");
        
        var answerButtonElement = this.getAnswerButtonElement();
        answerButtonElement.innerHTML = this.showButtonTitle;
        answerButtonElement.onclick = function() { Michailov.Equations.UI.showAnswer(); };
    },
    
    showSolution: function () {
        "use strict"
        
        var solutionParentElement = this.getSolutionParentElement();
        var constraints = Michailov.Equations.Constraints;
        if (constraints.solutionEnabled) {
            if (this.problemChanged) {
                Michailov.Equations.View.showSolution(solutionParentElement);
                this.problemChanged = false;
            }
        }
        solutionParentElement.setAttribute("class", "visible");
        
        var solutionButtonElement = this.getSolutionButtonElement();
        solutionButtonElement.innerHTML = this.hideButtonTitle;
        solutionButtonElement.onclick = function() { Michailov.Equations.UI.hideSolution(); };
    },
    
    hideSolution: function () {
        "use strict"
        
        var solutionParentElement = this.getSolutionParentElement();
        solutionParentElement.setAttribute("class", "hidden");
        
        var solutionButtonElement = this.getSolutionButtonElement();
        solutionButtonElement.innerHTML = this.showButtonTitle;
        solutionButtonElement.onclick = function() { Michailov.Equations.UI.showSolution(); };
    },

    showMethod: function () {
        "use strict"
        
        var methodParentElement = this.getMethodParentElement();
        methodParentElement.setAttribute("class", "visible");
        
        var methodButtonElement = this.getMethodButtonElement();
        methodButtonElement.innerHTML = this.hideButtonTitle;
        methodButtonElement.onclick = function() { Michailov.Equations.UI.hideMethod(); };
    },
    
    hideMethod: function () {
        "use strict"
        
        var methodParentElement = this.getMethodParentElement();
        methodParentElement.setAttribute("class", "hidden");
        
        var methodButtonElement = this.getMethodButtonElement();
        methodButtonElement.innerHTML = this.showButtonTitle;
        methodButtonElement.onclick = function() { Michailov.Equations.UI.showMethod(); };
    },
    
    getProblemParentElement: function () {
        return this.getCachedElement("_problemParentElement", "Problem");
    },
    
    getAnswerParentElement: function () {
        return this.getCachedElement("_answerParentElement", "Answer");
    },

    getAnswerButtonElement: function () {
        return this.getCachedElement("_answerButtonElement", "AnswerButton");
    },
    
    getSolutionParentElement: function () {
        return this.getCachedElement("_solutionParentElement", "Solution");
    },

    getSolutionButtonElement: function () {
        return this.getCachedElement("_solutionButtonElement", "SolutionButton");
    },
    
    getMethodParentElement: function () {
        return this.getCachedElement("_methodParentElement", "Method");
    },

    getMethodButtonElement: function () {
        return this.getCachedElement("_methodButtonElement", "MethodButton");
    },
    
    getCachedElement: function (memberName, elementId) {
        "use strict"
        
        if (this[memberName] == null) {
            this[memberName] = document.getElementById(elementId);
        }

        return this[memberName];
    },
    
    showButtonTitle: "&#xe10c;",
    hideButtonTitle: "&#xe10a;",
    refreshButtonTitle: "&#xe14a;",
    backButtonTitle: "&#xe112;",
    
    visibleState: "visible",
    hiddenState: "hidden",
    
    problemChanged: false,

    _problemParentElement: null,
    _answerParentElement: null,
    _answerButtonElement: null,
    _solutionParentElement: null,
    _solutionButtonElement: null,
    _methodParentElement: null,
    _methodButtonElement: null,
    
};


