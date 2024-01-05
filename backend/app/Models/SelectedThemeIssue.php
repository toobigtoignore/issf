<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SelectedThemeIssue extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'selected_theme_issue';
    protected $with = ['theme_issue_values'];

    public $timestamps = false;


    public function theme_issue_values(){
        return $this->belongsTo(ThemeIssueValue::class, 'theme_issue_value_id');
    }
}
