<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonOrganization extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'person_organizations';
    public $timestamps = false;

    public function person(){
        return $this->belongsTo(SSFPerson::class, 'ssfperson_id', 'issf_core_id');
    }
}
