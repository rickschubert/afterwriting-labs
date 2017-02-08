define(function(require) {

    var Env = require('acceptance/helper/env');

    describe('Editor', function() {

        var env;

        beforeEach(function() {
            env = Env.create();

            env.user.open_sample('brick_and_steel');
        });

        afterEach(function() {
            env.destroy();
        });

        it('WHEN save fountain locally is clicked THEN save fountain dialog is displayed', function() {
            // WHEN
            env.user.save_fountain_locally();

            // THEN
            env.assert.select_file_name_popup_is_visible();
        });

        it.only('WHEN save fountain to Dropbox button is clicked THEN save fountain to Dropbox dialog is displayed', function() {
            // WHEN
            env.user.save_fountain_dropbox();
            env.dropbox.auth_dropbox();
            env.browser.tick(3000);

            // THEN
            env.assert.dropbox_popup_visible();
        });

        it.skip('WHEN save fountain to GoogleDrive button is clicked THEN save fountain to GoogleDrive dialog is displayed', function() {

        });

        it.skip('WHEN a new file is opened THEN synchronisation and auto-save are not available', function() {

        });

        it.skip('WHEN a sample file is opened THEN synchronisation and auto-save are not available', function() {

        });

        it.skip('WHEN GoogleDrive is not available THEN save to GoogleDrive button is not visible', function() {

        });

        it.skip('WHEN Dropbox is not available THEN save to Dropbox button is not visible', function() {

        });

        it.skip('WHEN local file is loaded THEN auto-save is not available AND synchronisation is available', function() {

        });
        
        it.skip('WHEN a file is saved to Dropbox AND empty content is created THEN synchronisation and auto-save are notavailable')

        describe('After loading from Dropbox', function() {

            beforeEach(function(done) {

                env.dropbox.has_file({
                    name: 'file.fountain',
                    content: 'test content'
                });

                env.user.open_plugin('open');
                env.user.open_from_dropbox();
                env.dropbox.auth_dropbox();
                env.browser.tick(3000);
                env.user.select_file('file.fountain');
                env.user.confirm_popup();

                env.browser.read_files(function() {
                    env.browser.tick(3000);
                    env.user.open_plugin('editor');
                    env.browser.tick(3000);
                    done();
                });
            });

            describe('WHEN auto-save is enabled', function() {

                beforeEach(function() {
                    // WHEN
                    env.assert.dropbox_saved(0);
                    env.user.turn_auto_save_on();
                });

                it('THEN current content is saved immediately', function(done) {
                    env.assert.dropbox_saved(1);
                    done();
                });

                it('AND multiple save cycle passes THEN current content is saved once', function(done) {
                    // AND
                    env.browser.tick(3000);
                    env.browser.tick(3000);
                    env.browser.tick(3000);
                    env.assert.dropbox_saved(1);

                    done();
                });

                it('AND content changes THEN new content is saved', function(done) {
                    // AND
                    env.user.set_editor_content('changed content');
                    env.browser.tick(5000);
                    
                    // THEN
                    env.assert.dropbox_saved(2);
                    done();
                });

                it('AND content changes AND content is set to the same value THEN content is not saved', function(done) {
                    // AND: content changes
                    env.user.set_editor_content('changed content');
                    env.browser.tick(5000);

                    // AND: content is set to the same value
                    env.user.set_editor_content('changed content');
                    env.browser.tick(5000);
                    
                    // THEN
                    env.assert.dropbox_saved(2);
                    done();
                });

            });

            describe('WHEN synchronisation is enabled AND content of sync file changes', function() {

                beforeEach(function(done) {
                    // WHEN Synchronisation is enabled
                    env.user.turn_sync_on();
                    
                    // AND content od sync file changes
                    env.dropbox.content_change('file.fountain', 'changed content');
                    env.browser.tick(10000);
                    env.browser.read_files(function() {
                        env.browser.tick(3000);
                        done();
                    });
                });

                it('THEN content of the editor is set to new file contet', function(done) {
                    // THEN
                    env.assert.editor_content('changed content');
                    done();
                });

                it('AND synchronisation is disabled AND file content changes THEN editor content is not updated with the latest update', function(done) {
                    // AND: synchronisation is disabed
                    env.user.turn_sync_off();
                    
                    // AND: file content changes
                    env.dropbox.content_change('file.fountain', 'override after sync');
                    env.browser.tick(10000);
                    
                    // THEN 
                    env.assert.editor_content('changed content');
                    env.user.sync_keep_content();
                    env.assert.editor_content('changed content');

                    done();
                });

                it('AND file content changes AND synchronisation is disabled AND previous content is reloaded THEN editor content is set to previous value', function(done) {
                    // AND: file content changes
                    env.dropbox.content_change('file.fountain', 'override after sync');
                    env.browser.tick(10000);

                    // AND: sync disabled
                    env.user.turn_sync_off();
                    
                    // AND: previous content is reloaded
                    env.user.sync_reload_content_before_sync();
                    
                    // THEN
                    env.assert.editor_content('test content');
                    done();
                });
            });

        });

    });

});