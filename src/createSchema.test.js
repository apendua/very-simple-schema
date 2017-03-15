/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
/* eslint prefer-arrow-callback: "off" */
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import createSchema from './createSchema.js';
import presetDefault from './plugins/presetDefault.js';

chai.use(sinonChai);

describe('Test createSchema', function () {
  beforeEach(function () {
    this.errorCreator = sinon.spy();
    this.labelCreator = sinon.spy();
    this.customErrors = sinon.spy();
    this.getMessageTemplate = sinon.spy();
    this.Schema = createSchema({
      plugins: presetDefault,
      defaultCustomErrors: this.customErrors,
      defaultLabelCreator: this.labelCreator,
      defaultErrorCreator: () => {
        this.errorCreator();
        return new Error('error');
      },
      defaultGetMessageTemplate: () => this.getMessageTemplate,
    });
  });

  describe('When validation fails', function () {
    beforeEach(function () {
      (() => {
        new this.Schema(Number).validate('');
      }).should.throw('error');
    });
    it('should use custom error creator', function () {
      this.errorCreator.should.be.calledOnce;
    });
    it('should use custom label creator', function () {
      this.labelCreator.should.be.calledOnce;
    });
    it('should ask for custom errors', function () {
      this.customErrors.should.be.calledOnce;
    });
    it('should ask for custom message tempaltes', function () {
      this.getMessageTemplate.should.be.calledOnce;
    });
  });

  describe('Given a customized validator is used', function () {
    beforeEach(function () {
      this.errorCreator2 = sinon.spy();
      this.labelCreator2 = sinon.spy();
      this.customErrors2 = sinon.spy();
      this.getMessageTemplateSpy = sinon.spy();
      this.getMessageTemplate2 = (error) => {
        this.getMessageTemplateSpy();
        return () => error;
      };
    });

    beforeEach(function () {
      this.validate = new this.Schema(Number).validator({
        customErrors: this.customErrors2,
        labelCreator: this.labelCreator2,
        errorCreator: () => {
          this.errorCreator2();
          return new Error('error');
        },
        getMessageTemplate: this.getMessageTemplate2,
      });
      (() => {
        this.validate('');
      }).should.throw('error');
    });
    it('should use custom error creator', function () {
      this.errorCreator2.should.be.calledOnce;
    });
    it('should use custom label creator', function () {
      this.labelCreator2.should.be.calledOnce;
    });
    it('should ask for custom errors', function () {
      this.customErrors2.should.be.calledOnce;
    });
    it('should ask for custom message tempaltes', function () {
      this.getMessageTemplateSpy.should.be.calledOnce;
    });
  });
});
