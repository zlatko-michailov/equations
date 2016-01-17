// Depends on: ["Michailov.Base.js", "Michailov.Math.js"]

Michailov.Equations = {

    Params: {
        rank: 0,
        coeffLimit: 0,
        vars: ["x", "y", "z", "p", "q", "r", "s", "t", "u", "v", "w"],
    },

    Problem: {
        root: null,
        coeff: null,
        free: null,

        generate: function () {
            "use strict"
            
            Michailov.Debug.clear();

            this.root = [];
            this.coeff = [];
            this.free = [];

            // root
            for (var i = 0; i < Michailov.Equations.Params.rank; i++) {
                this.root[i] = 1 + Math.floor(Math.random() * Michailov.Equations.Params.coeffLimit);
                Michailov.Debug.write(this.root[i] + " ");
            }
            Michailov.Debug.writeLine("");

            for (var i = 0; i < Michailov.Equations.Params.rank; i++) {
                // coeff
                this.coeff[i] = [];
                for (var j = 0; j < Michailov.Equations.Params.rank; j++) {
                    var sign = Math.floor(Math.random() * 4) == 0 ? -1 : +1; // 75% positive coeffs
                    this.coeff[i][j] = (1 + Math.floor(Math.random() * Michailov.Equations.Params.coeffLimit)) * sign;
                    Michailov.Debug.write(this.coeff[i][j] + " ");
                }

                // free
                this.free[i] = Michailov.Math.Vector.multiply(this.root, this.coeff[i]);
                Michailov.Debug.writeLine(" = " + this.free[i] + " ");
            }
        },
    },
    
    Solution: {
        elimination: null,
        substitution: null,
        
        generate: function () {
            "use strict"
            
            this.generateElimination();
            this.generateSubstitution();
        },
        
        generateElimination: function () {
            "use strict"
            
            this.elimination = [];
            
            var vars = Michailov.Equations.Params.vars;
            var rank = Michailov.Equations.Params.rank;
            var coeff = Michailov.Equations.Problem.coeff;
            var free = Michailov.Equations.Problem.free;

            // Eliminate from the highest to the lowest var index (z -> y -> x),
            // so that we will substitute from the lowest to the highest var index (x -> y -> z).
            for (var iVar = rank - 1; 0 < iVar; iVar--) {
                var varElimStep = {};
                varElimStep.rank = rank - 1;
                varElimStep.iVar = iVar;
                Michailov.Debug.writeLine("Eliminating " + Michailov.Equations.Params.vars[iVar]);
                
                // Find the smallest abs(coeff[][iVar]) != 0.
                var iBaseEquation = -1;
                var baseCoeff = 0;
                for (var iEquation = 0; iEquation < rank; iEquation++) {
                    var absCoeff = Math.abs(coeff[iEquation][iVar]);
                    if (absCoeff != 0 && (iBaseEquation < 0 || absCoeff < baseCoeff)) {
                        iBaseEquation = iEquation;
                        baseCoeff = absCoeff;
                    }
                }
                varElimStep.iBaseEquation = iBaseEquation;
                Michailov.Debug.writeLine("&nbsp;&nbsp;&nbsp;&nbsp;iBaseEquation=" + iBaseEquation);
                
                // Eliminate var[iVar] from each equation
                varElimStep.operations = [];
                varElimStep.coeff = [];
                varElimStep.free = [];
                for (iEquation = 0; iEquation < rank; iEquation++) {
                    if (iEquation != iBaseEquation) {
                        if (coeff[iEquation][iVar] == 0) {
                            // vars[iVar] doesn't exist in this equation => nop
                            var op = {
                                code: 0, // nop
                                baseFactor: 1,
                                factor: 1,
                                iEquation: iEquation,
                            };
                            
                            varElimStep.operations.push(op);
                            varElimStep.coeff.push(coeff[iEquation]);
                            varElimStep.free.push(free[iEquation]);
                        }
                        else {
                            var baseSign = Michailov.Math.Number.sign(coeff[iBaseEquation][iVar]);
                            var sign = Michailov.Math.Number.sign(coeff[iEquation][iVar]);
                            var commonDenominator = Michailov.Math.Number.getSimpleCommonDenominator(coeff[iBaseEquation][iVar], coeff[iEquation][iVar])
                            var op = {
                                baseFactor: Math.abs(commonDenominator / coeff[iBaseEquation][iVar]),
                                factor: Math.abs(commonDenominator / coeff[iEquation][iVar]),
                                iEquation: iEquation,
                            };
                            var newCoeff = [];
                            var newFree = 0;
                            
                            if (baseSign * sign < 0) {
                                // coeff[iBaseEquation][iVar] and coeff[iEquation][iVar] have different signs => add
                                op.code = 1; // add
                                for (var i = 0; i < rank; i++) {
                                    newCoeff[i] = (op.baseFactor * coeff[iBaseEquation][i]) + (op.factor * coeff[iEquation][i]);
                                }
                                newFree = (op.baseFactor * free[iBaseEquation]) + (op.factor * free[iEquation]);
                            }
                            else {
                                // coeff[iBaseEquation][iVar] and coeff[iEquation][iVar] have the same sign => subtract
                                if (Math.abs(free[iBaseEquation]) > Math.abs(free[iEquation])) {
                                    op.code = -2; // subtract iBaseEquation - iEquation
                                    for (var i = 0; i < rank; i++) {
                                        newCoeff[i] = (op.baseFactor * coeff[iBaseEquation][i]) - (op.factor * coeff[iEquation][i]);
                                    }
                                    newFree = (op.baseFactor * free[iBaseEquation]) - (op.factor * free[iEquation]);
                                }
                                else {
                                    op.code = -1; // subtract iEquation - iBaseEquation
                                    for (var i = 0; i < rank; i++) {
                                        newCoeff[i] = (op.factor * coeff[iEquation][i]) - (op.baseFactor * coeff[iBaseEquation][i]);
                                    }
                                    newFree = (op.factor * free[iEquation]) - (op.baseFactor * free[iBaseEquation]);
                                }
                            }
                            
                            varElimStep.operations.push(op);
                            varElimStep.coeff.push(newCoeff);
                            varElimStep.free.push(newFree);
                        }
                    }
                } // for (iEquation)
                
                this.elimination.push(varElimStep);

                Michailov.Debug.write("&nbsp;&nbsp;&nbsp;&nbsp;");
                for (var i = 0; i < varElimStep.operations.length; i++) {
                    Michailov.Debug.writeLine("&nbsp;&nbsp;&nbsp;&nbsp;op=" + varElimStep.operations[i].code + ", baseFactor=" + varElimStep.operations[i].baseFactor + ", factor=" + varElimStep.operations[i].factor);
                    Michailov.Debug.write("&nbsp;&nbsp;&nbsp;&nbsp;");
                    for (var j = 0; j < varElimStep.coeff[i].length; j++) {
                        Michailov.Debug.write(varElimStep.coeff[i][j] + " ");
                    }
                    Michailov.Debug.writeLine(" = " + varElimStep.free[i]);
                }
                
                rank--;
                coeff = varElimStep.coeff;
                free = varElimStep.free;
                    
                var debugEquationElement = Michailov.Equations.View.createEquationElement("EliminationSystem" + iVar, vars, rank /* rowCount */, rank /* colCount */, coeff, free, null /* subst */, 0 /* format */);
                Michailov.Debug.writeLine("<p>" + debugEquationElement.outerHTML + "</p>");
                Michailov.Debug.writeLine(Michailov.Equations.Params.vars[iVar] + " eliminated");
            }
        },
        
        generateSubstitution: function() {
            "use strict"
            
            this.substitution = [];

            // var[0] is determined on step this.elimination.length - 1 derectly, i.e. without any substitution.
            // var[iVar] is determined on step this.elimination.length - 1 - iVar through substitution.
            // var[rank - 1] is determined from the original problem through substitution.
            
            // var[0]: just solve the equation from the last elimination step
            Michailov.Debug.writeLine("Solving " + Michailov.Equations.Params.vars[0]);
            var iElimStep = this.elimination.length - 1;
            var varElimStep = this.elimination[iElimStep];
            var coeff = varElimStep.coeff;
            var free = varElimStep.free;
            var subst = [];
            var root = this.substituteAndSolveSimpleEquation(subst, coeff[0], free[0]);
            subst.push(root);
            
            var varSubstStep = {};
            varSubstStep.iElimStep = iElimStep;
            varSubstStep.iEquation = 0;
            varSubstStep.root = root;
            this.substitution.push(varSubstStep);

            // var[1]..var[rankParam-2]
            var rankParam = Michailov.Equations.Params.rank;
            for (var iVar = 1; iVar < rankParam - 1; iVar++) {
                iElimStep--;
                varElimStep = this.elimination[iElimStep];
                var rank = varElimStep.rank;
                coeff = varElimStep.coeff;
                free = varElimStep.free;
                Michailov.Debug.writeLine("Substituting and solving " + Michailov.Equations.Params.vars[iVar]);
                
                // Find the smallest abs(coeff[][iVar]) != 0.
                var iBaseEquation = -1;
                var baseCoeff = 0;
                for (var iEquation = 0; iEquation < rank; iEquation++) {
                    var absCoeff = Math.abs(coeff[iEquation][iVar]);
                    if (absCoeff != 0 && (iBaseEquation < 0 || absCoeff < baseCoeff)) {
                        iBaseEquation = iEquation;
                        baseCoeff = absCoeff;
                    }
                }
                Michailov.Debug.writeLine("&nbsp;&nbsp;&nbsp;&nbsp;iBaseEquation=" + iBaseEquation);
                
                root = this.substituteAndSolveSimpleEquation(subst, coeff[iBaseEquation], free[iBaseEquation]);
                subst.push(root);

                var varSubstStep = {};
                varSubstStep.iElimStep = iElimStep;
                varSubstStep.iEquation = iBaseEquation;
                varSubstStep.root = root;
                this.substitution.push(varSubstStep);
            }
            
            // var[rankParam-1]
            iVar = rankParam - 1;
            rank = Michailov.Equations.Params.rank;
            coeff = Michailov.Equations.Problem.coeff;
            free = Michailov.Equations.Problem.free;
            
            Michailov.Debug.writeLine("Substituting and solving " + Michailov.Equations.Params.vars[iVar]);
            
            // Find the smallest abs(coeff[][iVar]) != 0.
            var iBaseEquation = -1;
            var baseCoeff = 0;
            for (var iEquation = 0; iEquation < rank; iEquation++) {
                var absCoeff = Math.abs(coeff[iEquation][iVar]);
                if (iBaseEquation < 0 || absCoeff < baseCoeff) {
                    iBaseEquation = iEquation;
                    baseCoeff = absCoeff;
                }
            }
            Michailov.Debug.writeLine("&nbsp;&nbsp;&nbsp;&nbsp;iBaseEquation=" + iBaseEquation);
            
            root = this.substituteAndSolveSimpleEquation(subst, coeff[iBaseEquation], free[iBaseEquation]);
            subst.push(root);

            var varSubstStep = {};
            varSubstStep.iElimStep = null;
            varSubstStep.iEquation = iBaseEquation;
            varSubstStep.root = root;
            this.substitution.push(varSubstStep);
            
            // Store the roots if we don't already have them
            if (Michailov.Equations.Problem.root == null) {
                Michailov.Equations.Problem.root = subst;
            }
        },
        
        substituteAndSolveSimpleEquation: function (subst, coeff, free) {
            var newFree = free;
            for (var iVar = 0; iVar < subst.length; iVar++) {
                newFree -= subst[iVar] * coeff[iVar];
            }
            
            var root = newFree / coeff[subst.length];
            Michailov.Debug.writeLine("&nbsp;&nbsp;&nbsp;&nbsp;newFree=" + newFree + " subst={" + subst.toString() + "} coeff={" + coeff.toString() + "} iVar=" + subst.length + " root=" + root);
            return root;
        },
    },
    
    View: {
        showNewProblem: function (parentElement) {
            "use strict"
            
            Michailov.Equations.Problem.generate();
            Michailov.Equations.View.clearElement(parentElement);
            Michailov.Equations.View.fillProblemElement(parentElement);
        },
        
        fillProblemElement : function (parentElement) {
            "use strict"
            
            var vars = Michailov.Equations.Params.vars;
            var rank = Michailov.Equations.Params.rank;
            var coeff = Michailov.Equations.Problem.coeff;
            var free = Michailov.Equations.Problem.free;

            var newProblemElement = this.createEquationElement(this._problemElementName, vars, rank /* rowCount */, rank /* colCount */, coeff, free, null /* subst */, 0 /* format */);
            parentElement.appendChild(newProblemElement);
        },

        showAnswer: function (parentElement) {
            "use strict"
            
            if (Michailov.Equations.Problem.root == null) {
                Michailov.Equations.Solution.generate();
            }
            Michailov.Equations.View.clearElement(parentElement);
            Michailov.Equations.View.fillAnswerElement(parentElement);
        },
        
        fillAnswerElement: function (parentElement) {
            "use strict"
            
            var vars = Michailov.Equations.Params.vars;
            var root = Michailov.Equations.Problem.root;
            var gridBaseIndex = 1;
            var gridElement = this.createGridElement("AnswerGrid", root.length);

            for (var iVar = 0; iVar < root.length; iVar++) {
                // Row: var = root
                var rowElement = this.appendRowElement(gridElement);
                this.appendCellElement(rowElement, "equation-item variable", "&nbsp;" + vars[iVar]);
                this.appendCellElement(rowElement, "equation-item", "&nbsp;=&nbsp;");
                this.appendCellElement(rowElement, "equation-value", root[iVar]);
            }
            
            parentElement.appendChild(gridElement);
        },
        
        showSolution: function (parentElement) {
            "use strict"
            
            Michailov.Equations.Solution.generate();
            Michailov.Equations.View.clearElement(parentElement);
            Michailov.Equations.View.fillSolutionElement(parentElement);
        },
        
        fillSolutionElement: function (parentElement) {
            "use strict"
            
            var solution = Michailov.Equations.Solution;
            var vars = Michailov.Equations.Params.vars;
            var rank = Michailov.Equations.Params.rank;
            var coeff = Michailov.Equations.Problem.coeff;
            var free = Michailov.Equations.Problem.free;
            
            // Show elimination
            this.appendSubsectionTitle(parentElement, "Elimination");
            for (var iElimStep = 0; iElimStep < solution.elimination.length; iElimStep++) {
                var varElimStep = solution.elimination[iElimStep];
                rank = varElimStep.rank;
                coeff = varElimStep.coeff;
                free = varElimStep.free;
                
                var descriptionHTML = "Eliminate <span class='code variable'>" + vars[varElimStep.iVar] + "</span> using the " + this.getOrdinalText(varElimStep.iBaseEquation + 1) + " equation. "
                this.appendDescription(parentElement, descriptionHTML);

                for (var key in varElimStep.operations) {
                    var op = varElimStep.operations[key];
                    var iEquation = op.iEquation;
                    if (op.code == 0) {
                        descriptionHTML = "<span class='code variable'>" + vars[varElimStep.iVar] + "</span> is already missing from the " + this.getOrdinalText(iEquation + 1) + " equation."
                        this.appendDescription(parentElement, descriptionHTML);
                    }
                    else {
                        descriptionHTML = "Multiply both sides of the " + this.getOrdinalText(varElimStep.iBaseEquation + 1) + " equation by " + op.baseFactor + ". ";
                        descriptionHTML += "Multiply both sides of the " + this.getOrdinalText(iEquation + 1) + " equation by " + op.factor + ". ";
                        descriptionHTML += (op.code == 1 ? "Add" : "Subtract") + " the two equations. ";
                        this.appendDescription(parentElement, descriptionHTML);
                    }
                }

                var descriptionHTML = "The new system is:"
                this.appendDescription(parentElement, descriptionHTML);

                var eliminationElement = Michailov.Equations.View.createEquationElement("Elimination" + iElimStep, vars, rank /* rowCount */, rank /* colCount */, coeff, free, null /* subst */, 0 /* format */);
                this.appendEquationElement(parentElement, eliminationElement);
            }
            
            // Show substitution
            var subst = [];
            for (var iSubstStep = 0; iSubstStep < solution.substitution.length; iSubstStep++) {
                var varSubstStep = solution.substitution[iSubstStep];
                if (varSubstStep.iElimStep != null ) {
                    var varElimStep = solution.elimination[varSubstStep.iElimStep];
                    rank = varElimStep.rank;
                    coeff[0] = varElimStep.coeff[varSubstStep.iEquation];
                    free[0] = varElimStep.free[varSubstStep.iEquation];
                }
                else {
                    rank = Michailov.Equations.Params.rank;
                    coeff[0] = Michailov.Equations.Problem.coeff[varSubstStep.iEquation];
                    free[0] = Michailov.Equations.Problem.free[varSubstStep.iEquation];
                }
                
                if (subst.length > 0) {
                    descriptionHTML = "Substitute ";
                    for (var iVar = 0; iVar < subst.length; iVar++ ) {
                        descriptionHTML += " <span class='code variable'>" + vars[iVar] + "</span> ";
                    }
                    descriptionHTML += "with its value in the " + this.getOrdinalText(varSubstStep.iEquation + 1) + " equation of the ";
                    if (iSubstStep < solution.substitution.length - 1) {
                        descriptionHTML += "system produced after the elimination of <span class='code variable'>" + vars[iSubstStep + 1] + "</span>:";
                    }
                    else {
                        descriptionHTML += "original problem:";
                    }
                    this.appendDescription(parentElement, descriptionHTML);
                    var substitutionElement = Michailov.Equations.View.createEquationElement("Substitution" + iSubstStep, vars, 1 /* rowCount */, rank /* colCount */, coeff, free, subst, 1 /* format */);
                    this.appendEquationElement(parentElement, substitutionElement);
                }
                
                this.appendDescription(parentElement, "Solve that simple equation:");
                var rootExpressionElement = Michailov.Equations.View.createEquationElement("RootExpression" + iSubstStep, vars, 1 /* rowCount */, rank /* colCount */, coeff, free, subst, 2 /* format */);
                this.appendEquationElement(parentElement, rootExpressionElement);

                if (subst.length == 0) {
                    this.appendSubsectionTitle(parentElement, "Substitution");
                }
                
                subst.push(varSubstStep.root);
            }
        },
        
        createEquationElement: function (id, vars, rowCount, colCount, coeff, free, subst, format) {
            "use strict"
            
            var gridElement = this.createGridElement(id, rowCount);

            for (var iRow = 0; iRow < rowCount; iRow++) {
                var rowElement = this.appendRowElement(gridElement);
                
                if (format == 0 || format == 1) { 
                    // coeff[0] var[0]
                    this.appendCellElement(rowElement, "equation-item", this.hide0(coeff[iRow][0], this.hide1(coeff[iRow][0])));
                    this.appendCellElement(rowElement, "variable equation-item", this.hide0(coeff[iRow][0], this.substituteVar(0, vars, subst, format)));

                    for (var iCol = 1; iCol < colCount; iCol++) {
                        // sign coeff var
                        this.appendCellElement(rowElement, "equation-item", "&nbsp;" + this.hide0(coeff[iRow][iCol], this.sign(coeff[iRow][iCol])) + "&nbsp;");
                        this.appendCellElement(rowElement, "equation-item", this.hide0(coeff[iRow][iCol], this.hide1(Math.abs(coeff[iRow][iCol]))));
                        this.appendCellElement(rowElement, "variable equation-item", this.hide0(coeff[iRow][iCol], this.substituteVar(iCol, vars, subst, format)));
                    }

                    // = free
                    this.appendCellElement(rowElement, "equation-item", "&nbsp;=&nbsp;");
                    this.appendCellElement(rowElement, "equation-item", free[iRow]);
                }
                else if (format == 2) {
                    // First row: x = (free - coeff*subst - coeff*subst) / coeff
                    
                    var iVar = subst.length;
                    
                    // var =
                    this.appendCellElement(rowElement, "variable equation-item", "&nbsp;" + vars[iVar]);
                    this.appendCellElement(rowElement, "equation-item", "&nbsp;=&nbsp;");

                    // (
                    var html = "";
                    html += (iVar > 0 && coeff[0][iVar] != 1 ? "(" : "");
                    
                    // free
                    var divident = free[0];
                    html += this.enclose(free[0]);
                    
                    if (iVar > 0) {
                        for (var iCol = 0; iCol < iVar; iCol++) {
                            // -
                            html += "&nbsp;-&nbsp;";
                            var num = coeff[0][iCol] * subst[iCol];
                            divident -= num;
                            html += this.enclose(num);
                        }
                        
                        // )
                        if (coeff[0][iVar] != 1) {
                            html += ")";
                        }
                    }

                    if (coeff[0][iVar] != 1) {
                        // / coeff
                        html += "&nbsp;/&nbsp;";
                        html += this.enclose(coeff[0][iVar]);
                    }

                    this.appendCellElement(rowElement, "equation-item", html);

                    if (iVar > 0) {
                        // Second row: x = divident / coeff
                        rowElement = this.appendRowElement(gridElement);
                        this.appendCellElement(rowElement, "variable equation-item", "&nbsp;" + vars[iVar]);
                        this.appendCellElement(rowElement, "equation-item", "&nbsp;=&nbsp;");
                        this.appendCellElement(rowElement, "equation-value", this.enclose(divident) + "&nbsp;/&nbsp;" + this.enclose(coeff[0][iVar]));
                    }
                    
                    // Third row: x = root
                    rowElement = this.appendRowElement(gridElement);
                    this.appendCellElement(rowElement, "variable equation-item root", "&nbsp;" + vars[iVar]);
                    this.appendCellElement(rowElement, "equation-item root", "&nbsp;=&nbsp;");
                    this.appendCellElement(rowElement, "equation-item equation-value", "<span class='root'>" + divident / coeff[0][iVar] + "&nbsp;</span>");
                }
            }

            return gridElement;
        },
        
        appendCellElement: function (rowElement, className, innerHTML) {
            "use strict"
            
            var cellElement = document.createElement("td");
            cellElement.setAttribute("class", className);
            cellElement.innerHTML = innerHTML;
            rowElement.appendChild(cellElement);
        },
        
        appendRowElement: function (gridElement) {
            "use strict"
            
            var rowElement = document.createElement("tr");
            gridElement.appendChild(rowElement);
            
            return rowElement;
        },
        
        createGridElement: function (id, rowCount) {
            "use strict"
            
            var gridElement = document.createElement("table");
            gridElement.setAttribute("id", id);
            
            var className = "code equation";
            if (rowCount > 1) {
                className += " multiline";
            }
            gridElement.setAttribute("class", className);
            
            return gridElement;
        },
        
        appendEquationElement: function (parentElement, equationElement) {
            "use strict"
            
            var wrapperElement = document.createElement("p");
            wrapperElement.appendChild(equationElement);
            parentElement.appendChild(wrapperElement);
        },
        
        appendSubsectionTitle: function (parentElement, subsectionHTML) {
            "use strict"
            
            var subsectionElement = document.createElement("p");
            subsectionElement.setAttribute("class", "section-subtitle");
            subsectionElement.innerHTML = subsectionHTML;
            parentElement.appendChild(subsectionElement);
        },
        
        appendDescription: function (parentElement, descriptionHTML) {
            "use strict"
            
            var descriptionElement = document.createElement("p");
            descriptionElement.innerHTML = descriptionHTML;
            parentElement.appendChild(descriptionElement);
        },
        
        getOrdinalText: function (i) {
            "use strict"
            
            var lastDigit = i % 10;
            return lastDigit == 1 ? i + "st" :
                   lastDigit == 2 ? i + "nd" :
                   lastDigit == 3 ? i + "rd" :
                   i + "th";
        },
        
        sign: function (x) {
            return x < 0 ? "-" : "+";
        },
        
        hide0: function (x, y) {
            return x == 0 ? "" : y;
        },

        hide1: function (x) {
            return x == 1 ? "" : (x == -1 ? "-" : x.toString());
        },
        
        enclose: function (x) {
            return x < 0 ? "(" + x + ")" : x.toString();
        },
        
        substituteVar: function (iVar, vars, subst, format) {
            return format == 1 && subst != null && subst.length > iVar ? "(" + subst[iVar] + ")" : vars[iVar];
        },
        
        clearElement: function (parentElement) {
            "use strict"
            
            var skipCount = 0;
            for (var parentChildNodes = parentElement.childNodes; parentChildNodes.length > skipCount; parentChildNodes = parentElement.childNodes) {
                var childNode = parentChildNodes.item(skipCount);
                if (childNode.className != "section-title") {
                    parentElement.removeChild(childNode);
                }
                else {
                    skipCount++;
                }
            }
        },
        
        _problemElementName: "Equations",
    },

};