<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Sorting in the activity completion report.
 *
 * @package    report_progress
 * @copyright 2021 Thong Bui <qktc1422@gmail.com>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace report_progress\output;

use single_select;
use moodle_url;
defined('MOODLE_INTERNAL') || die();

/**
 * Class for sorting in the activity completion report.
 *
 * @package    report_progress
 * @copyright 2021 Thong Bui <qktc1422@gmail.com>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class report_progress_sorting {

    /** @var array The options to select in menu sort. */
    protected $options;

    /** @var array The action to sort. */
    protected $sortactions;

    /**
     * sorting_progress constructor.
     *
     */
    public function __construct() {
        $this->options = [0 => get_string('sortactivityorder', 'report_progress'),
                1 => get_string('sortactivityname', 'report_progress')];
        $this->sortactions = [0 => 'sort_by_order', 1 => 'sort_by_name'];
    }

    /**
     *  Render sort menu selector for progress report activity completion.
     *
     * @param string $rooturl
     * @param string $sortactive
     * @return string html used to display the select sort type.
     */
    public function render_sorting_filter(string $rooturl, string $sortactive): string {
        global $OUTPUT;
        $sortmenu = self::get_sortmenu();
        $sorttable = new single_select(new moodle_url($rooturl), 'sort_by',
                $sortmenu, $sortactive, null, 'sort-select-report');
        $sorttable->set_label(get_string('sortlabel', 'report_progress'));
        return $OUTPUT->render($sorttable);
    }

    /**
     * Sorted activities by sorttype.
     *
     * @param array $activities The reference array completion activities
     * @param int $sorttype The action sorting.
     */
    public function sort_activities(array &$activities, int $sorttype = 0) {
        if (method_exists($this, $this->sortactions[$sorttype])) {
            $this->{$this->sortactions[$sorttype]}($activities);
        }
    }

    /**
     * Get menu options.
     *
     * @return array The array options to select.
     */
    public function get_sortmenu(): array {
        return $this->options;
    }

    /**
     * Sort the activities by name.
     *
     * @param array $activities The reference array completion activities
     */
    public function sort_by_name(array &$activities) {
        usort($activities, function($a, $b) {
            return strcmp($a->name, $b->name);
        });
    }

    /**
     * Sort the activities by the order, the order default is order sorting.
     *
     * @param array $activities
     * @return array The activities, by default the activities sort order.
     */
    public function sort_by_order(array $activities): array {
        return $activities;
    }
}
