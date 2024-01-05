<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ISSFCore;
use App\Models\SSFPerson;
use App\Models\UserProfile;

class RecentContributionsController extends Controller
{
    public function get_contributions_by_type($records){
        $record_types = config('constants.RECORD_TYPES');
        $ssf_person = $ssf_sota = $ssf_profile = $ssf_organization = $ssf_case_study = $ssf_governance = $ssf_bluejustice = $ssf_guidelines = 0;
        foreach ($records as $record) {
            switch($record->core_record_type){
                case $record_types['WHO']: $ssf_person++; break;
                case $record_types['SOTA']: $ssf_sota++; break;
                case $record_types['PROFILE']: $ssf_profile++; break;
                case $record_types['ORGANIZATION']: $ssf_organization++; break;
                case $record_types['CASESTUDY']: $ssf_case_study++; break;
                case $record_types['BLUEJUSTICE']: $ssf_bluejustice++; break;
                case $record_types['GUIDELINES']: $ssf_guidelines++; break;
                default: break;
            }
        }

        return array(
            [ 'core_record_type' => $record_types['WHO'], 'total' => $ssf_person ],
            [ 'core_record_type' => $record_types['SOTA'], 'total' => $ssf_sota ],
            [ 'core_record_type' => $record_types['PROFILE'], 'total' => $ssf_profile ],
            [ 'core_record_type' => $record_types['ORGANIZATION'], 'total' => $ssf_organization ],
            [ 'core_record_type' => $record_types['CASESTUDY'], 'total' => $ssf_case_study ],
            [ 'core_record_type' => $record_types['BLUEJUSTICE'], 'total' => $ssf_bluejustice ],
            [ 'core_record_type' => $record_types['GUIDELINES'], 'total' => $ssf_guidelines ]
        );
    }


    public function get_recent_contributions(){
        $filter_date = date('Y-m-d', strtotime('-12 months'));
        $records = ISSFCore::where('contribution_date' , '>', $filter_date)->get(['issf_core_id', 'core_record_type', 'contributor_id']);

        return array(
            'recent_contributions' => ISSFCore::latest('issf_core_id')
                                                ->take(10)
                                                ->get(['issf_core_id', 'core_record_type', 'core_record_summary', 'contributor_id']),
            'recent_contributions_by_type' => $this->get_contributions_by_type($records),
            'top_contributors' => $this->get_top_contributors($records)
        );
    }


    public function get_top_contributors($records){
        $contributors_ids = array_column($records->toArray(), 'contributor_id');
        $distinct_ids = array_unique($contributors_ids);
        $contributions = [];

        foreach($distinct_ids as $id){
            $contributor = $records->filter(fn($record) => $record->contributor_id === $id)
                                    ->first()
                                    ->user;
            $contributor_name = $contributor->username;

            if($contributor->first_name || $contributor->last_name){
                $contributor_name = $contributor->first_name . ' ' . $contributor->last_name;
            }

            $link_to_contributor = 'mailto:' . $contributor->email;
            $person_core_record = ISSFCore::where('core_record_type', '=', config('constants.RECORD_TYPES.WHO'))
                                ->where('contributor_id', '=', $id)
                                ->first();

            if($person_core_record){
                $person = SSFPerson::where('issf_core_id', '=', $person_core_record->issf_core_id)->first();
                if($person){
                    $link_to_contributor = "/details/who/" . $person->id;
                }
            }

            array_push($contributions, [
                'contributor_name' => $contributor_name,
                'link_to_contributor' => $link_to_contributor,
                'total_contribution' => array_count_values($contributors_ids)[$id]
            ]);
        }

        return $contributions;
    }
}
