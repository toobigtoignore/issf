<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThemeIssueCategory extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'theme_issue_categories';

    public $timestamps = false;


    public function theme_issue_values(){
        return $this->hasMany(ThemeIssueValue::class);
    }
}
