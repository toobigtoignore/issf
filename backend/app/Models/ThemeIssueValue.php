<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThemeIssueValue extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'theme_issue_values';
    protected $with = ['category'];

    public $timestamps = false;


    public function category(){
        return $this->belongsTo(ThemeIssueCategory::class, 'category_id');
    }
}
