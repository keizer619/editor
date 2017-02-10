/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
define(['lodash', 'log','./ballerina-view','./../ast/block-statement', 'typeMapper','./type-mapper-statement-view','ballerina/ast/ballerina-ast-factory'],
    function (_, log, BallerinaView,BlockStatement, TypeMapperRenderer,TypeMapperStatement,BallerinaASTFactory) {

        var TypeMapperBlockStatementView = function (args) {
            BallerinaView.call(this, args);
            this._parentView = _.get(args, "parentView");
            this._onConnectInstance = _.get(args, 'onConnectInstance', {});
            this._onDisconnectInstance = _.get(args, 'onDisconnectInstance', {});
            this._sourceInfo = _.get(args, 'sourceInfo', {});
            this._targetInfo = _.get(args, 'targetInfo', {});

            if (_.isNil(this.getModel()) || !(this._model instanceof BlockStatement)) {
                log.error("Block Statement is undefined or is of different type." + this.getModel());
                throw "Block Statement is undefined or is of different type." + this.getModel();
            }

        };

        TypeMapperBlockStatementView.prototype = Object.create(BallerinaView.prototype);
        TypeMapperBlockStatementView.prototype.constructor = TypeMapperBlockStatementView;

        TypeMapperBlockStatementView.prototype.canVisitBlockStatement = function (blockStatement) {
            return true;
        };

        /**
         * Rendering the view of the Block Statement.
         * @param {Object} diagramRenderingContext - the object which is carrying data required for rendering
         */
        TypeMapperBlockStatementView.prototype.render = function (diagramRenderingContext) {
            this._diagramRenderingContext = diagramRenderingContext;
            var self = this;

            this._parentView.setOnConnectInstance(self.onAttributesConnect);
            this._parentView.setOnDisconnectInstance(self.onAttributesDisConnect);

            this._model.accept(this);
            this._model.on('child-added', function (child) {
               this.visit(child)
            }, this)

        };

        /**
         * Calls the render method for a statements.
         * @param {statement} statement - The statement model.
         */
        TypeMapperBlockStatementView.prototype.visitStatement = function (statement) {

            var self = this;
            if(BallerinaASTFactory.isAssignmentStatement(statement)){
                var typeMapperStatementView = new TypeMapperStatement({
                    model: statement, parentView: this, typeMapperRenderer: this._parentView.getTypeMapperRenderer(),sourceInfo: self.getSourceInfo(),
                    targetInfo: self.getTargetInfo()
                });

                typeMapperStatementView.render(this.diagramRenderingContext);
            }

        };


        /**
         * Receives attributes connected
         * @param connection object
         */
        TypeMapperBlockStatementView.prototype.onAttributesConnect = function (connection) {

            var assignmentStatementNode = connection.targetReference.getParent().
                returnConstructedAssignmentStatement("y","x",connection.sourceProperty,connection.targetProperty);
            var blockStatement = connection.targetReference.getParent().getBlockStatement();
            blockStatement.addChild(assignmentStatementNode);
//
//            connection.targetReference.getParent().addAssignmentStatement(assignmentStatementNode);

//            var assignmentStmt = BallerinaASTFactory.createAssignmentStatement();
//            var leftOp = BallerinaASTFactory.createLeftOperandExpression();
//            var leftOperandExpression = "x." + connection.targetProperty;
//            leftOp.setLeftOperandExpressionString(leftOperandExpression);
//            var rightOp = BallerinaASTFactory.createRightOperandExpression();
//            var rightOperandExpression = "y." + connection.sourceProperty;
//            if (connection.isComplexMapping) {
//                rightOperandExpression = "(" + connection.complexMapperName + ":" + connection.targetType + ")" +
//                    rightOperandExpression;
//            }
//            rightOp.setRightOperandExpressionString(rightOperandExpression);
//            assignmentStmt.addChild(leftOp);
//            assignmentStmt.addChild(rightOp);
//
//            var index = _.findLastIndex(connection.targetReference.getParent().getChildren(), function (child) {
//                return BallerinaASTFactory.isVariableDeclaration(child);
//            });
//            connection.targetReference.getParent().addChild(assignmentStmt, index + 1);

        };

        /**
         * Receives the attributes disconnected
         * @param connection object
         */
        TypeMapperBlockStatementView.prototype.onAttributesDisConnect = function (connection) {

            connection.targetReference.getParent().removeAssignmentDefinition(connection.sourceProperty,
                connection.targetProperty);
        };

        /**
         * returns the source info
         * @returns {object}
         */
        TypeMapperBlockStatementView.prototype.getSourceInfo = function () {
            return this._sourceInfo;
        };

        /**
         * returns the source info
         * @returns {object}
         */
        TypeMapperBlockStatementView.prototype.getTargetInfo = function () {
            return this._targetInfo;
        };

        return TypeMapperBlockStatementView;
});