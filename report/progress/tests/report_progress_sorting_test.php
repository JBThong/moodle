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
 * Tests for the progress report sorting.
 *
 * @package   report_progress
 * @copyright 2021 Thong Bui <qktc1422@gmail.com>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Class for tests sort the activity completion in the progress report.
 *
 * @copyright 2021 Thong Bui <qktc1422@gmail.com>
 *
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.
 */
class report_progress_sorting_testcase extends advanced_testcase {

    public function setUp(): void {
        $this->setAdminUser();
        $this->resetAfterTest();
        $this->generator = $this->getDataGenerator();
        $this->course = $this->generator->create_course();
        $this->quiz1 = $this->generator->create_module('quiz', ['course' => $this->course->id, 'name' => 'quiz3']);
        $this->quiz2 = $this->generator->create_module('quiz', ['course' => $this->course->id, 'name' => 'quiz2']);
        $this->quiz3 = $this->generator->create_module('quiz', ['course' => $this->course->id, 'name' => 'quiz1']);
        $this->activities = [];
        $this->activities[] = $this->quiz1;
        $this->activities[] = $this->quiz2;
        $this->activities[] = $this->quiz3;
    }

    public function test_sort_activities() {

        $srt = new \report_progress\output\report_progress_sorting();
        $expectedsortname = [];
        $expectedsortname[] = $this->quiz3;
        $expectedsortname[] = $this->quiz2;
        $expectedsortname[] = $this->quiz1;

        $expectedsortorder = [];
        $expectedsortorder[] = $this->quiz1;
        $expectedsortorder[] = $this->quiz2;
        $expectedsortorder[] = $this->quiz3;

        // Sort the activities by the order.
        $srt->sort_activities($this->activities, 0);
        $this->assertEquals($expectedsortorder, $this->activities);

        // Sort the activities by the name.
        $srt->sort_activities($this->activities, 1);
        $this->assertEquals($expectedsortname, $this->activities);

    }
}
