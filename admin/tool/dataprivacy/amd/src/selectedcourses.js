// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

/**
 * Selected courses.
 *
 * @module     tool_dataprivacy/selected_courses
 * @package    tool_dataprivacy
 * @copyright  2020 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import $ from 'jquery';
import * as Str from 'core/str';
import Ajax from 'core/ajax';
import Notification from 'core/notification';
import ModalFactory from 'core/modal_factory';
import ModalEvents from 'core/modal_events';
import Fragment from 'core/fragment';

/**
 * Selected Courses popup modal.
 *
 */
class SelectedCourses {

    /**
     * Constructor
     *
     * @param {String} contextId Context ID to load the fragment.
     * @param {String} requestId ID of data export request.
     */
    constructor(contextId, requestId) {

        this.contextId = contextId;
        this.requestId = requestId;

        this.stringKeys = [
            {
                key: 'selectcourses',
                component: 'tool_dataprivacy'
            },
            {
                key: 'save',
                component: 'admin'
            },
            {
                key: 'errornoselectedcourse',
                component: 'tool_dataprivacy'
            }
        ];
        this.strings = Str.get_strings(this.stringKeys);

        this.strings.then((strings) => {
            return ModalFactory.create({
                type: ModalFactory.types.SAVE_CANCEL,
                title: strings[0],
                body: '',
            }).done((modal) => {
                this.setupFormModal(modal, strings[1]);
            });
        }).fail(Notification.exception);
    }

    /**
     * @var {String} contextId Context ID to load the fragment.
     * @private
     */
    contextId = 0;

    /**
     * @var {String} requestId ID of data export request.
     * @private
     */
    requestId = 0;

    /**
     * @var {Promise}
     * @private
     */
    strings = null;

    /**
     * Get body of modal.
     *
     * @method getBody
     * @param {Object} formdata
     * @private
     * @return {Promise}
     */
    getBody = (formdata) => {

        let params = null;
        if (typeof formdata !== "undefined") {
            params = {jsonformdata: JSON.stringify(formdata)};
        }
        // Get the content of the modal.
        return Fragment.loadFragment('tool_dataprivacy', 'selectcourses_form', this.contextId, params);
    };

    /**
     * Setup and show modal.
     *
     * @method setupFormModal
     * @param {Object} modal
     * @param {String} saveText
     * @private
     */
    setupFormModal = (modal, saveText) => {
        // Forms are big, we want a big modal.
        modal.setLarge();

        modal.setSaveButtonText(saveText);

        // We want to reset the form every time it is opened.
        modal.getRoot().on(ModalEvents.hidden, this.destroy.bind(this));

        modal.setBody(this.getBody({requesid: this.requestId}));

        // We catch the modal save event, and use it to submit the form inside the modal.
        // Triggering a form submission will give JS validation scripts a chance to check for errors.
        modal.getRoot().on(ModalEvents.save, this.submitForm.bind(this));
        // We also catch the form submit event and use it to submit the form with ajax.
        modal.getRoot().on('submit', 'form', this.submitFormAjax.bind(this));

        this.modal = modal;

        modal.show();
    };

    /**
     * This triggers a form submission, so that any mform elements can do final tricks before the form submission is processed.
     *
     * @method submitForm
     * @param {Event} e Form submission event.
     * @private
     */
    submitForm = (e) => {
        e.preventDefault();
        this.modal.getRoot().find('form').submit();
    };

    /**
     * Submit select courses form using ajax.
     *
     * @method submitFormAjax
     * @private
     * @param {Event} e Form submission event.
     */
    submitFormAjax = (e) => {

        e.preventDefault();

        // Convert all the form elements values to a serialised string.
        let formData = this.modal.getRoot().find('form').serialize();

        if (formData.indexOf('coursecontextids') === -1) {
            let customSelect = this.modal.getRoot().find('.custom-select');
            let invalidText = this.modal.getRoot().find('.invalid-feedback');
            $(customSelect).addClass('is-invalid');
            $(invalidText).attr('style', 'display: block');
            this.strings.then((string) => {
                $(invalidText).empty().append(string[2]);
                return;
            }).fail(Notification.exception);
            return;
        }

        Ajax.call([{
            methodname: 'tool_dataprivacy_submit_selected_courses_form',
            args: {requestid: this.requestId, jsonformdata: JSON.stringify(formData)},
            done: (data) => {
                if (data.warnings.length > 0) {
                    this.modal.setBody(this.getBody(formData));
                } else {
                    this.handleFormSubmissionResponse();
                }
            },
            fail: Notification.exception
        }]);
    };

    /**
     * Reload page when submission is successful.
     *
     * @method handleFormSubmissionResponse
     * @private
     */
    handleFormSubmissionResponse = () => {
        this.destroy();
        document.location.reload();
    };

    /**
     * Reset form when modal is hidden.
     *
     * @method destroy
     * @private
     */
    destroy = () => {
        Y.use('moodle-core-formchangechecker', () => {
            M.core_formchangechecker.reset_form_dirty_state();
        });
        this.modal.destroy();
    };
}

/**
 * Get instance of tool_dataprivacy/selected_courses
 *
 * @param {String} contextId contextId Context ID to load the fragment.
 * @param {String} requestId ID of data export request.
 * @return {SelectedCourses} the SelectedCourses instance.
 */
export const showSelectedCoursesModal = (contextId, requestId) => {
    return new SelectedCourses(contextId, requestId);
};
