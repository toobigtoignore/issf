<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SSFProfile extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'ssf_profile';
    protected $with = ['core'];
    public $timestamps = false;

    public function core(){
        return $this->belongsTo(ISSFCore::class, 'issf_core_id');
    }
}
