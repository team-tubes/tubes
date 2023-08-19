use once_cell::sync::Lazy;
use tera::{Context, Tera};

use crate::data::Complaint;

static TEMPLATES: Lazy<Tera> = Lazy::new(|| {
    let mut tera = Tera::default();
    tera.add_raw_template(
        "complaints",
        include_str!("../templates/complaints.html.tera"),
    )
    .expect("Could not load complaints template");
    tera
});

pub fn render_complaints(complaints: Vec<Complaint>) -> Result<String, tera::Error> {
    let mut context = Context::new();
    context.insert("complaints", &complaints);
    TEMPLATES.render("complaints", &context)
}
