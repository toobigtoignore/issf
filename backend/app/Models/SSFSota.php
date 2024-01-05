<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SSFSota extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'ssf_sota';
    protected $with = ['core', 'publication', 'original_language'];
    public $timestamps = false;

    public function core(){
        return $this->belongsTo(ISSFCore::class, 'issf_core_id');
    }

    public function original_language(){
        return $this->belongsTo(Language::class, 'nonenglish_language_id');
    }

    public function publication(){
        return $this->belongsTo(PublicationType::class, 'publication_type_id');
    }
}
