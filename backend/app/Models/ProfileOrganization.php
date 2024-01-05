<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfileOrganization extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'profile_organization_id';
    protected $table = 'profile_organization';
    public $timestamps = false;

    public function ssf_profile(){
        return $this->belongsTo(SSFProfile::class, 'ssfprofile_id');
    }

    public function organization(){
        return $this->belongsTo(SSFOrganization::class, 'ssforganization_id', 'issf_core_id');
    }
}
