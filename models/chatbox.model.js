module.exports = {
    que_insertMsg: `
    INSERT INTO tab_message (
        id,
         id_user,
         message,
         date_creation,
         statut,
         flag_customer,
         id_discussion
    ) 
    VALUES (
        NULL,
        ?,
        ?,
         CURRENT_TIMESTAMP ,
        'en cours',
        ?,
        ?
    )
    `,
    que_selectMsg: `
    SELECT message 
    FROM tab_message 
    WHERE message =? AND date_creation = CURRENT_TIMESTAMP`,
    que_cloture: `
    INSERT INTO tab_message (
        id,
         id_user,
         message,
         date_creation,
         statut,
         flag_customer,
         id_discussion
    ) 
    VALUES (
        NULL,
        91,
        'conversation terminée',
        CURRENT_TIMESTAMP ,
        'cloturé',
        DEFAULT,
        ?
    )`,
    que_discussion: `
    INSERT INTO tab_discussion (
        id_discussion,
         statut_dis,
         date_creation
    ) VALUES (
        NULL,
        'en attente',
        CURRENT_TIMESTAMP
    );
    `,
    que_current_discussion: `
    SELECT * 
    FROM tab_discussion 
    WHERE date_creation = CURRENT_TIMESTAMP`,
    que_statut_discussion: `
    SELECT d.statut_dis
    FROM tab_message m 
    inner JOIN tab_discussion d 
    on m.id_discussion = d.id_discussion 
    WHERE d.statut_dis='en attente' AND
    m.id_discussion = ?`,
    que_update_discussion: `
    UPDATE tab_discussion
    SET statut_dis = ?
    WHERE id_discussion = ?`

}